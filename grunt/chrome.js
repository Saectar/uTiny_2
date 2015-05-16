exports.run = function (grunt) {
    grunt.config.merge({
        'json-format': {
            chromeManifestFormat: {
                expand: true,
                src: '<%= output %><%= vendor %>manifest.json',
                dest: '<%= output %><%= vendor %>',
                rename: function () {
                    return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                },
                options: {
                    indent: 4
                }
            }
        },
        compress: {
            chrome: {
                options: {
                    mode: 'zip',
                    archive: '<%= output %><%= vendor %>../<%= buildName %>.zip'
                },
                files: [{
                    expand: true,
                    filter: 'isFile',
                    src: '<%= output %><%= vendor %>/**',
                    dest: './',
                    rename: function () {
                        return arguments[0] + arguments[1].substr((grunt.config('output') + grunt.config('vendor')).length);
                    }
                }]
            }
        }
    });

    grunt.registerTask('chromeManifest', function() {
        var manifestPath = grunt.template.process('<%= output %><%= vendor %>manifest.json');
        var content = grunt.file.readJSON('src/manifest.json');
        content.version = grunt.config('pkg.extVersion');
        grunt.file.write(manifestPath, JSON.stringify(content));
    });

    var sovetnikPath = 'src/vendor/sovetnik/grunt.js';
    var sovetnik;
    if (grunt.file.exists(sovetnikPath)) {
        sovetnik = require('../' + sovetnikPath);
    } else {
        grunt.registerTask('sovetnik', function () {});
    }

    grunt.registerTask('chrome', function () {
        grunt.config.merge({
            browser: 'chrome',
            vendor: 'chrome/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'uTorrentEasyClient_<%= pkg.extVersion %>'
        });

        sovetnik && sovetnik.run(grunt);

        grunt.task.run([
            'extensionBaseMin',
            'chromeManifest',
            'sovetnik',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });

    grunt.registerTask('opera', function () {
        grunt.config.merge({
            browser: 'opera',
            vendor: 'opera/src/',
            libFolder: 'js/',
            dataJsFolder: 'js/',
            includesFolder: 'includes/',
            dataFolder: '',
            buildName: 'uTorrentEasyClient_opera_<%= pkg.extVersion %>'
        });

        sovetnik && sovetnik.run(grunt);

        grunt.task.run([
            'extensionBaseMin',
            'chromeManifest',
            'sovetnik',
            'json-format:chromeManifestFormat',
            'compress:chrome'
        ]);
    });
};