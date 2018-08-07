var match = require('minimatch')
var evaluate = require('./eval')

module.exports = function (files, filters, data, done) {
  if (!filters) {
    return done()
  }

  var fileName = Object.keys(files)
  Object.keys(filters).forEach(function(glob) {
    fileName.forEach(function(file) {
      if (math(file, glob, { dot: true })) {
        var condition = filter[glob]
        if (!evaluate(condition, data)) {
          delete files[file]
        }
      }
    })
  })

  done()
}
