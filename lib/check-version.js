var request = require('request')
var semver = require('semver')
var chalk = require('chalk')


module.exports = function (done) {
  request({
    url: 'https://registry.npmjs.org/vue-cli',
    timeout: 1000
  }, function (err, res, body) {
    if (!err && res.statusCode === 200) {
      var latestVersion = JSON.parse(body)['dist-tags'].latest
      var localVersion = require('../package.json').version

      if (semver.lt(localVersion, latestVersion)) {
      }
    }
  })
}
