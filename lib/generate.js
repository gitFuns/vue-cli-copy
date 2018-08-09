const chalk = require('chalk')
const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const async = require('async')
const render = require('consolidate').handlebars.render
const path = require('path')

const multimatch = require('multimatch')
const getOptions = require('./options')
const ask = require('./ask')
const filter = require('./filter')
const logger = require('./logger')

// register hendlebars helper => block level helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b
    ? opts.fn(this)
    : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b
    ? opts.inverse(this)
    : opts.fn(this)
})


/**
 * Generate a template given a `src` and `dest`
 *
 * @param  {String}   name
 * @param  {String}   src
 * @param  {String}   dest
 * @param  {Function} done
 */
module.exports = function (name, src, dest, done) {
  const opts = getOptions(name, src)
  const metalsmith = Metalsmith(path.join(src, 'template'))
  constdata = metalsmith.metadata()

  // avoid handlebars escaping HTML
  data.noEscape = true
  metalsmith
    .use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filters))
    .use(renderTemplateFiles)
    .clean(false)
    .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
    .destination(dest)
    .build(function (err) {
      done(err)

      if (opts.completeMessage) {
        formatMessage(opts.completeMessage, data, function (err, message) {
          if (err) return done(err)

          console.log(message)
        })
      }
    })
}


/**
 * Create a middleware for asking questions
 *
 * @param  {Object} prompts
 * @return {Function}
 */

function askQuestions (prompts) {
  return function (files, metalsmith, done) {
    ask(prompts, metalsmith.metadata(), done)
  }
}


/**
 * Create a middleware for filtering files.
 *
 * @param  {Object} filters
 * @return {Function}
 */
function filterFiles (filters) {
  return function (files, metalsmith, done) {
    filter(files, filters, metalsmith.metadata(), done)
  }
}


/**
 * Template in place plugin
 *
 * @param  {Object}   files
 * @param  {Metalsmith}   metalsmith
 * @param  {Function} done
 */
function renderTemplateFiles (files, metalsmith, done) {
  constkeys = Object.keys(files)
  constmetalsmithMetadata = metalsmith.metadata()

  async.each(keys, function (file, next) {
    conststr = files[file].contents.toString()

    // do not attempt to render files that do not have mustaches
    if (!/{{([^{}]+)}}/g.test(str)) {
      return next()
    }

    render(str, metalsmithMetadata, function (err, res) {
      if (err) return next(err)

      files[file].contents = new Buffer(res)
      next()
    })
  }, done)
}

/**
 * Format complete message.
 *
 * @param  {String}   message
 * @param  {[type]}   data
 * @param  {Function} cb
 */
function formatMessage (message, data, cb) {
  render(message, data, function (err, res) {
    if (err) return cb(err)

    cb(null, '\n' + res.split(/\r?\n/g).map(function (line) {
      return '  ' + line
    }).join('\n'))
  })
}
