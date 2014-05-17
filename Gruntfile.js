'use strict'

var request = require('request')

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt)
  // load all grunt tasks
  require('load-grunt-tasks')(grunt)

  var reloadPort = 35729, files

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    develop: {
      server: {
        file: 'server/app.js',
        tasks: ['less']
      }
    },
    less: {
      options: {
        paths: [ "server/public/css" ],
        compress: false,
        yuicompress: false
      },
      src: {
        expand: true,
        src: 'server/public/css/*.less',
        ext: '.css'
      }
    },
    watch: {
      options: {
        nospawn: true,
        livereload: reloadPort
      },
      server: {
        files: [ 'server/app.js' ],
        tasks: ['develop', 'delayed-livereload']
      },
      js: {
        files: ['server/public/**/*.js']
      },
      css: {
        files: ['server/public/**/*.{less,css}']
      },
      hbs: {
        files: ['server/**/*.html']
      }
    }
  })

  grunt.config.requires('watch.server.files')
  files = grunt.config('watch.server.files')
  files = grunt.file.expand(files)

  grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
    var done = this.async()
    setTimeout(function () {
      request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
          var reloaded = !err && res.statusCode === 200
          if (reloaded) {
            grunt.log.ok('Delayed live reload successful.')
          } else {
            grunt.log.error('Unable to make a delayed live reload.')
          }
          done(reloaded)
        })
    }, 500)
  })

  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.registerTask('default', ['develop', 'watch'])
}
