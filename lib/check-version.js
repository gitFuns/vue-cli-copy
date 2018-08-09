const request = require('request')
const semver = require('semver')  // 版本比较库
const chalk = require('chalk')
const package = require('../package.json')


module.exports = (done) => {

  // Ensure minimum supported node version is used
  if (!semver.satisfies(process.version, package.engines.node)) {
    return console.log(chalk.red(
      '  You must upgrade node to >=' + package.engines.node + '.x to use vue-cli'
    ))
  }

  request({
    url: 'https://registry.npmjs.org/vue-cli',
    timeout: 1000
  }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      const latestVersion = JSON.parse(body)['dist-tags'].latest
      const localVersion = package.version

      if (semver.lt(localVersion, latestVersion)) {
        console.log(chalk.yellow(' A new version of vue-cli is available.'))
        console.log()
        console.log(' latest: ' + chalk.green(latestVersion))
        console.log(' installed: ' + chalk.red(localVersion))
        console.log()
      }
    }
    done()
  })
}
