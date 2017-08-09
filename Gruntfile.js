module.exports = function(grunt) {
    var pkg = grunt.file.readJSON('package.json'),
        fs = require('fs'),
        source_files = grunt.file.read('source_files.json').toString();

    source_files = source_files.replace(/<%= webapi_path %>/g, pkg.webapi_path);
	source_files = JSON.parse(source_files);
    grunt.initConfig({
        pkg: pkg,
		source_files: source_files,
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
        }
    });

    // Load the plugin that provides the "concat" task.
	grunt.loadNpmTasks('grunt-contrib-concat');
	// Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('default', ["concat:webApi", "uglify:webApi"]);
};