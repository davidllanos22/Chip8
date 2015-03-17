module.exports = function(grunt) {
  grunt.initConfig({
    "babel": {
      options: {
        sourceMap: false
      },
      dist: {
        files: {
          // dest - src
          "build/chip8.js" : "src/chip8.js",
          "build/emulator.js" : "src/emulator.js",
          
        }
      }
    },
    connect: {
      server: {
        options: {
          livereload: true,
          port: 8888,
          base: 'public'
        }
      }
    },
    watch: {
      options: {
          livereload: true,
      },
      src: {
        files: ['src/**/*'],
        tasks: ['build']
      },
      public: {
        files: ['public/index.html'],
        tasks: []
      }
    },
    uglify: {
      build: {
        options: {
          beautify: false  
        },
        src: [  
            'build/*.js',
        ],
        dest: 'public/chip8.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  
  grunt.registerTask('default', ['build']);

  grunt.registerTask('build', ['babel','uglify']);
  grunt.registerTask('serve', ['connect','watch']);
}