const path = require('path')
const metadata = require('read-metadata')
const exists = require('fs').existsSync
const getGitUser = require('./git-user')
const validateName = require('validate-npm-package-name')


/**
 * Read prompts metadata
 * get full complete prompts opts object
 *
 * @param  {string} dir  [description]
 * @return {Object}
 */
module.exports = function options(name, dir) {
  const opts = getMetadata(dir)

  setDefault(opts, 'name', name)
  setValidateName(opts)

  const author = getGitUser()
  if (author) {
    setDefault(opts, 'author', author)
  }

  return opts
}


/**
 * Gets the metadata from either a meta.json or meta's file
 *
 * @param  {String} dir
 * @return {Object}
 */
function getMetadata(dir) {
  const json = path.join(dir, 'meta.json')
  const js = path.join(dir, 'meta.js')

  let opts = {}

  if (exists(json)) {
    opts = metadata.sync(json)
  } else if (exists(js)) {
    const req = require(path.resolve(js)) // resolve 确认该路径存在

    if (req !== Object(req)) {           // 避免 req = null 的判断
      throw new Error('meta.js needs to expose an object')
    }

    opts = req
  }

  return opts
}


/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts
 * @param {String} key
 * @param {String} value
 */
function setDefault(opts, key, value) {
  if (opts.schema) {
    opts.prompts = opts.schema

    delete opts.schema
  }

  const prompts = opts.prompts || (opts.prompts = {})
  if (!prompts[key] || typeof prompts[key] !== 'object') {
    prompts[key] = {
      'type': 'string',
      'default': value
    }
  } else {
    prompts[key]['default'] = value
  }
}


/**
 *  在 name自定义校验前加入
 *  validateName统一校验
 */
function setValidateName(opts) {
  const name = opts.prompts.name
  const customValidate = name.validate

  name.validate = name => {
    const its = validateName(name)
    if(!its.validForNewPackages) {
      const errors = (its.errors || []).concat(its.warnings || [])

      return 'Sorry, ' + errors.join(' and ') + '.'
    }

    if (typeof customValidate === 'function') return customValidate(name)

    return true
  }
}
