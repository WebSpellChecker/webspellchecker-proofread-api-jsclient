module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json'),
        fs = require('fs'),
        source_files = grunt.file.read('source_files.json').toString();

    source_files = source_files.replace(/<%= webapi_path %>/g, pkg.webapi_path);
	source_files = JSON.parse(source_files);
    grunt.initConfig({
        pkg: pkg,
        source_files: source_files,
        copy: {
            documentationAboutWebApi: {
				src: 'AboutWebApi.md',
				dest: 'tmp/AboutWebApi.md'
			},
        },
        'string-replace': {
            documentationAboutWebApi: {
                files: {
					'tmp/AboutWebApi.md': 'tmp/AboutWebApi.md'
				},
				options: {
					replacements: [{
						pattern: /(<#COPYRIGHTS#>)/ig,
						replacement: '<%= full_text_copyrights %>'
					}]
				}
            }
        },
        concat: {
            webApi: {
                src: '<%= source_files.webapi %>',
                dest: '<%= pkg.webapi_path %>/dest/uncompressed/webspellchecker-api.js',
                nonull: true
            }
        },
        uglify: {
            options: {
				banner: '/**\n * <%= pkg.name %> v<%= pkg.version %>\n * Copyright (c) 2000-<%= new Date().getFullYear() %> WebSpellChecker Ltd. All rights reserved.\n */' // <%= grunt.template.today("yyyy-mm-dd")
            },
            webApi: {
                src: '<%= concat.webApi.dest %>',
                dest: '<%= pkg.webapi_path %>/dest/webspellchecker-api.js',
                nonull: true
            }
        },
        jsdoc: {
            documentationWebApi: {
				src: ['<%= pkg.webapi_path %>/webapi.js', 'tmp/AboutWebApi.md'],
				options: {
					destination : '<%= pkg.webapi_path %>/documentation',
					configure : "jsdoc.json"
				}
			},
        },
        clean: {
			tmp: ['tmp/']
		}
    });

    // file copy
	grunt.loadNpmTasks('grunt-contrib-copy');
	// Load the plugin that provides the "clean" task
	grunt.loadNpmTasks('grunt-contrib-clean');
    // Load the plugin that provides the "concat" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	// Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
	// replace string
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('documentation', 'build WebApi documentation', function() {
        var full_text_copyrights = grunt.option('full_text_copyrights') || grunt.file.read('full_copyrights.txt');
        grunt.config.data.full_text_copyrights = full_text_copyrights;

        grunt.task.run(['copy:documentationAboutWebApi']);
        grunt.task.run(['string-replace:documentationAboutWebApi']);
        grunt.task.run(['jsdoc:documentationWebApi']);
        grunt.task.run(['clean:tmp']);
    });

	grunt.registerTask('default', ["concat:webApi", "uglify:webApi"]);
};