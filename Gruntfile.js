module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json'),
        fs = require('fs'),
        source_files = grunt.file.read('source_files.json').toString();

    source_files = source_files.replace(/<%= webapi_path %>/g, pkg.webapi_path);
	source_files = JSON.parse(source_files);
    grunt.initConfig({
        pkg: pkg,
        source_files: source_files,
        'replace': {
			wscbundle: {
				files: [{
					expand: true,
					flatten: false,
					src: ['<%= concat.wscbundle.dest %>']
				}],
				options: {
					patterns: [{
						match: "VERSION",
						replacement: '<%= pkg.full_version %>'
					}, {
						json: "<%= links %>"
					}]
				}
            }
        },
        'replace': {
            documentationAboutWebApi: {
                files: [{
					expand: true,
					flatten: false,
					src: ['documentation/*.html']
				}],
				options: {
					patterns: [
						{
							json: {
                                "COPYRIGHTS": "<%= full_text_copyrights %>",
                                "BRANDING_CUSTOM_DICT_MANUAL_URL": "http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed"
							}
						}
					]
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
				src: ['<%= pkg.webapi_path %>/webapi.js', 'AboutWebApi.md'],
				options: {
					destination : '<%= pkg.webapi_path %>/documentation',
					configure : "jsdoc.json"
				}
			},
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
	grunt.loadNpmTasks('grunt-replace');

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('documentation', 'build WebApi documentation', function() {
        var full_text_copyrights = grunt.option('full_text_copyrights') || grunt.file.read('full_copyrights.txt');
        grunt.config.data.full_text_copyrights = full_text_copyrights;

        grunt.task.run(['jsdoc:documentationWebApi']);
        grunt.task.run(['replace:documentationAboutWebApi']);
    });

	grunt.registerTask('default', ["concat:webApi", "uglify:webApi"]);
};