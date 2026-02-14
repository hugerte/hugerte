/*eslint-env node */
const { string: PluginString } = require('rollup-plugin-string');
const FilesAsStrings = PluginString({
  include: '**/*.svg'
});

let zipUtils = require('./tools/modules/zip-helper');
let gruntUtils = require('./tools/modules/grunt-utils');
let gruntWebPack = require('./tools/modules/grunt-webpack');
let swag = require('@ephox/swag');
let path = require('path');

let plugins = [
  'accordion', 'advlist', 'anchor', 'autolink', 'autoresize', 'autosave', 'charmap', 'code', 'codesample',
  'directionality', 'emoticons', 'help', 'fullscreen', 'image', 'importcss', 'insertdatetime',
  'link', 'lists', 'media', 'nonbreaking', 'pagebreak', 'preview', 'save', 'searchreplace',
  'table', 'template', 'visualblocks', 'visualchars', 'wordcount', 'quickbars'
];

let themes = [
  'silver'
];

let models = [
  'dom',
];

let oxideUiSkinMap = {
  'dark': 'oxide-dark',
  'default': 'oxide',
  'hugerte-5': 'hugerte-5',
  'hugerte-5-dark': 'hugerte-5-dark'
};

const stripSourceMaps = function (data) {
  const sourcemap = data.lastIndexOf('/*# sourceMappingURL=');
  return sourcemap > -1 ? data.slice(0, sourcemap) : data;
};

module.exports = function (grunt) {
  const packageData = grunt.file.readJSON('package.json');

  // Determine the release date
  const dateRe = new RegExp('^##\\s+' + packageData.version.toString().replace(/\./g, '\\.') + '\\s+\\-\\s+([\\d-]+)$', 'm');
  const changelog = grunt.file.read('CHANGELOG.md').toString();
  const dateMatch = dateRe.exec(changelog);
  if (dateMatch !== null) {
    packageData.date = dateMatch[1];
  } else {
    packageData.date = 'TBD';
  }

  grunt.initConfig({
    pkg: packageData,

    shell: {
      prismjs: { command: 'node ./bin/build-prism.js', cwd: '../../' },
      tsc: { command: 'tsc -b' },
      moxiedoc: { command: 'moxiedoc "src/core/main/ts" -t hugertenext --fail-on-warning --dry' }
    },

    eslint: {
      target: [ 'src/**/*.ts' ]
    },

    globals: {
      options: {
        configFile: 'src/core/main/json/globals.json',
        outputDir: 'lib/globals',
        templateFile: 'src/core/main/js/GlobalsTemplate.js'
      }
    },

    rollup: Object.assign(
      {
        core: {
          options: {
            treeshake: true,
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              FilesAsStrings,
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: {
                  'hugerte/core': 'lib/core/main/ts'
                }
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: 'lib/core/main/ts/api/Main.js',
              dest: 'js/hugerte/hugerte.js'
            }
          ]
        },
        'core-types': {
          options: {
            treeshake: true,
            format: 'es',
            onwarn: (warning) => {
              // Ignore circular deps in types
              if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                swag.onwarn(warning)
              }
            },
            plugins: [
              FilesAsStrings,
              swag.dts({
                respectExternal: true,
                keepVariables: [ 'hugerte' ],
                keepComments: false
              })
            ]
          },
          files: [
            {
              src: 'lib/core/main/ts/api/PublicApi.d.ts',
              dest: 'js/hugerte/hugerte.d.ts'
            }
          ]
        }
      },
      gruntUtils.generate(plugins, 'plugin', (name) => {
        return {
          options: {
            treeshake: true,
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              FilesAsStrings,
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'hugerte/core': 'lib/globals/hugerte/core'
                }, [
                  [`hugerte/plugins/${name}`, `lib/plugins/${name}/main/ts`]
                ]),
                mappers: [
                  swag.mappers.replaceDir('./lib/core/main/ts/api', './lib/globals/hugerte/core/api'),
                  swag.mappers.invalidDir('./lib/core/main/ts')
                ]
              }),
              swag.remapImports()
            ]
          },
          files:[ { src: `lib/plugins/${name}/main/ts/Main.js`, dest: `js/hugerte/plugins/${name}/plugin.js` } ]
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          options: {
            treeshake: true,
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              FilesAsStrings,
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'hugerte/core': 'lib/globals/hugerte/core'
                }, [
                  [`hugerte/themes/${name}/resources`, `src/themes/${name}/main/resources`],
                  [`hugerte/themes/${name}`, `lib/themes/${name}/main/ts`]
                ]),
                mappers: [
                  swag.mappers.replaceDir('./lib/core/main/ts/api', './lib/globals/hugerte/core/api'),
                  swag.mappers.invalidDir('./lib/core/main/ts')
                ]
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: `lib/themes/${name}/main/ts/Main.js`,
              dest: `js/hugerte/themes/${name}/theme.js`
            }
          ]
        };
      }),
      gruntUtils.generate(models, 'model', (name) => {
        return {
          options: {
            treeshake: true,
            format: 'iife',
            onwarn: swag.onwarn,
            plugins: [
              FilesAsStrings,
              swag.nodeResolve({
                basedir: __dirname,
                prefixes: gruntUtils.prefixes({
                  'hugerte/core': 'lib/globals/hugerte/core'
                }, [
                  [`hugerte/models/${name}`, `lib/models/${name}/main/ts`]
                ]),
                mappers: [
                  swag.mappers.replaceDir('./lib/core/main/ts/api', './lib/globals/hugerte/core/api'),
                  swag.mappers.invalidDir('./lib/core/main/ts')
                ]
              }),
              swag.remapImports()
            ]
          },
          files:[
            {
              src: `lib/models/${name}/main/ts/Main.js`,
              dest: `js/hugerte/models/${name}/model.js`
            }
          ]
        };
      })
    ),

    emojis: {
      twemoji: {
        base: '',
        ext: '.png'
      }
    },

    terser: Object.assign(
      {
        options: {
          ecma: 2018,
          output: {
            comments: 'all',
            ascii_only: true
          },
          compress: {
            passes: 2
          }
        },
        core: {
          files: [
            { src: 'js/hugerte/hugerte.js', dest: 'js/hugerte/hugerte.min.js' },
            { src: 'js/hugerte/icons/default/icons.js', dest: 'js/hugerte/icons/default/icons.min.js' },
          ]
        },
        // very similar to the emoticons plugin, except mangle is off
        'emoticons-raw': {
          options: {
            mangle: false,
            compress: false,
            output: {
              indent_level: 2
            }
          },
          files: [
            { src: 'src/plugins/emoticons/main/js/emojis.js', dest: 'js/hugerte/plugins/emoticons/js/emojis.js' },
            { src: 'src/plugins/emoticons/main/js/emojiimages.js', dest: 'js/hugerte/plugins/emoticons/js/emojiimages.js' }
          ]
        }
      },
      gruntUtils.generate(plugins, 'plugin', (name) => {
        var pluginExtras = {
          emoticons: [
            { src: 'src/plugins/emoticons/main/js/emojis.js', dest: 'js/hugerte/plugins/emoticons/js/emojis.min.js' },
            { src: 'src/plugins/emoticons/main/js/emojiimages.js', dest: 'js/hugerte/plugins/emoticons/js/emojiimages.min.js' }
          ]
        };
        return {
          files: [
            { src: `js/hugerte/plugins/${name}/plugin.js`, dest: `js/hugerte/plugins/${name}/plugin.min.js` }
          ].concat(pluginExtras.hasOwnProperty(name) ? pluginExtras[name] : [])
        };
      }),
      gruntUtils.generate(themes, 'theme', (name) => {
        return {
          files: [ { src: `js/hugerte/themes/${name}/theme.js`, dest: `js/hugerte/themes/${name}/theme.min.js` } ]
        };
      }),
      gruntUtils.generate(models, 'model', (name) => {
        return {
          files: [ { src: `js/hugerte/models/${name}/model.js`, dest: `js/hugerte/models/${name}/model.min.js` } ]
        };
      })
    ),

    'webpack-dev-server': {
      everything: () => gruntWebPack.all(plugins, themes, models),
      options: {
        devServer: {
          port: grunt.option('webpack-port') !== undefined ? grunt.option('webpack-port') : 3000,
          host: '0.0.0.0',
          allowedHosts: 'all',
          static: {
            publicPath: '/',
            directory: path.join(__dirname)
          },
          hot: false,
          liveReload: false,
          setupMiddlewares: (middlewares, devServer) => {
            gruntWebPack.generateDemoIndex(grunt, devServer.app, plugins, themes, models);
            return middlewares;
          }
        }
      },
    },

    concat: Object.assign({
        options: {
          process: function(content) {
            return content.
              replace(/@@version@@/g, packageData.version).
              replace(/@@releaseDate@@/g, packageData.date);
          }
        },
        core: {
          src: [
            'src/core/text/build-header.js',
            'src/core/text/dompurify-license-header.js',
            'js/hugerte/hugerte.js'
          ],
          dest: 'js/hugerte/hugerte.js'
        }
      },
      gruntUtils.generate(plugins, 'plugin', function (name) {
        return {
          src: [
            'src/core/text/build-header.js',
            name === 'codesample' ? 'src/core/text/prismjs-license-header.js' : null,
            `js/hugerte/plugins/${name}/plugin.js`
          ].filter(Boolean),
          dest: `js/hugerte/plugins/${name}/plugin.js`
        };
      }),
      gruntUtils.generate(themes, 'theme', function (name) {
        return {
          src: [
            'src/core/text/build-header.js',
            name === 'silver' ? 'src/core/text/dompurify-license-header.js' : null,
            `js/hugerte/themes/${name}/theme.js`
          ].filter(Boolean),
          dest: `js/hugerte/themes/${name}/theme.js`
        };
      }),
      gruntUtils.generate(models, 'model', function (name) {
        return {
          src: [
            'src/core/text/build-header.js',
            `js/hugerte/models/${name}/model.js`
          ],
          dest: `js/hugerte/models/${name}/model.js`
        };
      })
    ),

    copy: {
      core: {
        options: {
          process: function (content) {
            return content.
              replace('@@majorVersion@@', packageData.version.split('.')[0]).
              replace('@@minorVersion@@', packageData.version.split('.').slice(1).join('.')).
              replace('@@releaseDate@@', packageData.date);
          }
        },
        files: [
          {
            src: 'js/hugerte/hugerte.js',
            dest: 'js/hugerte/hugerte.js'
          },
          {
            src: 'js/hugerte/hugerte.min.js',
            dest: 'js/hugerte/hugerte.min.js'
          },
          {
            src: 'src/core/main/text/readme_lang.md',
            dest: 'js/hugerte/langs/README.md'
          },
          {
            src: '../../LICENSE.TXT',
            dest: 'js/hugerte/license.txt'
          },
          {
            src: '../../README.md',
            dest: 'js/hugerte/README.md'
          }
        ]
      },
      'default-icons': {
        files: [
          {
            expand: true,
            cwd: '../oxide-icons-default/dist/icons/default',
            src: '**',
            dest: 'js/hugerte/icons/default'
          }
        ]
      },
      'ui-skins': {
        files: gruntUtils.flatMap(oxideUiSkinMap, function (name, mappedName) {
          return [
            {
              expand: true,
              cwd: '../oxide/build/skins/ui/' + name,
              src: '**',
              dest: 'js/hugerte/skins/ui/' + mappedName
            }
          ];
        })
      },
      'content-skins': {
        files: [
          {
            expand: true,
            cwd: '../oxide/build/skins/content',
            src: '**',
            dest: 'js/hugerte/skins/content'
          },
        ]
      },
      'visualblocks-plugin': {
        files: [
          { src: 'src/plugins/visualblocks/main/css/visualblocks.css', dest: 'js/hugerte/plugins/visualblocks/css/visualblocks.css' }
        ]
      },
      'html-i18n': {
        files: [
          {
            expand: true,
            cwd: 'src/plugins/help/main/js/i18n/keynav',
            src: '**',
            dest: 'js/hugerte/plugins/help/js/i18n/keynav'
          }
        ]
      }
    },

    moxiezip: {
      production: {
        options: {
          baseDir: 'hugerte',
          excludes: [
            'js/**/plugin.js',
            'js/**/theme.js',
            'js/**/model.js',
            'js/**/icons.js',
            'js/**/*.map',
            'js/hugerte/hugerte.full.min.js',
            'js/hugerte/plugins/moxiemanager',
            'js/hugerte/plugins/visualblocks/img',
            'js/hugerte/README.md',
            'README.md'
          ],
          to: 'dist/hugerte_<%= pkg.version %>.zip',
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          }
        },
        src: [
          'js/hugerte/langs',
          'js/hugerte/plugins',
          'js/hugerte/skins/**/*.js',
          'js/hugerte/skins/**/*.min.css',
          'js/hugerte/skins/**/*.woff',
          'js/hugerte/icons',
          'js/hugerte/themes',
          'js/hugerte/models',
          'js/hugerte/hugerte.d.ts',
          'js/hugerte/hugerte.min.js',
          'js/hugerte/license.txt',
          'CHANGELOG.md',
          'LICENSE.TXT',
          'README.md'
        ]
      },

      development: {
        options: {
          baseDir: 'hugerte',
          excludes: [
            '../../modules/*/dist',
            '../../modules/*/build',
            '../../modules/*/scratch',
            '../../modules/*/lib',
            '../../modules/*/tmp',
            '../../modules/hugerte/js/hugerte/hugerte.full.min.js',
            '../../scratch',
            '../../node_modules'
          ],
          to: 'dist/hugerte_<%= pkg.version %>_dev.zip'
        },
        files: [
          {
            expand: true,
            cwd: '../../',
            src: [
              'modules/*/src',
              'modules/*/CHANGELOG.md',
              'modules/*/Gruntfile.js',
              'modules/*/gulpfile.js',
              'modules/*/README.md',
              'modules/*/README.md',
              'modules/*/package.json',
              'modules/*/tsconfig*.json',
              'modules/*/.eslint*.json',
              'modules/*/webpack.config.js',
              'modules/*/.stylelintignore',
              'modules/*/.stylelintrc',
              'modules/hugerte/tools',
              'bin',
              'patches',
              '.yarnrc',
              'LICENSE.TXT',
              'README.md',
              'lerna.json',
              'package.json',
              'tsconfig*.json',
              '.eslint*.json',
              'yarn.lock'
            ]
          },
          {
            expand: true,
            cwd: '../../',
            src: 'modules/hugerte/js',
            dest: '/',
            flatten: true
          }
        ]
      },

      cdn: {
        options: {
          onBeforeSave: function (zip) {
            zip.addData('dist/version.txt', packageData.version);
          },
          pathFilter: function (zipFilePath) {
            return zipFilePath.replace('js/hugerte/', 'dist/');
          },
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          },
          onBeforeConcat: function (destPath, chunks) {
            // Strip the license from each file and prepend the license, so it only appears once
            var license = grunt.file.read('src/core/text/build-header.js').replace(/@@version@@/g, packageData.version).replace(/@@releaseDate@@/g, packageData.date);
            return [license].concat(chunks.map(function (chunk) {
              return chunk.replace(license, '').trim();
            }));
          },
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.js',
            'js/**/*.dev.svg',
            'js/**/*.map',
            'js/hugerte/hugerte.full.min.js',
            'js/hugerte/plugins/moxiemanager',
            'js/hugerte/plugins/visualblocks/img',
            'js/hugerte/README.md',
            'README.md',
            'js/tests/.jshintrc'
          ],
          concat: [
            {
              src: [
                'js/hugerte/hugerte.d.ts',
                'js/hugerte/hugerte.min.js',
                'js/hugerte/themes/*/theme.min.js',
                'js/hugerte/models/*/model.min.js',
                'js/hugerte/plugins/*/plugin.min.js',
                '!js/hugerte/plugins/example/plugin.min.js',
                '!js/hugerte/plugins/example_dependency/plugin.min.js'
              ],

              dest: [
                'js/hugerte/hugerte.min.js'
              ]
            },
          ],
          to: 'dist/hugerte_<%= pkg.version %>_cdn.zip'
        },
        src: [
          'js/hugerte/hugerte.js',
          'js/hugerte/langs',
          'js/hugerte/plugins',
          'js/hugerte/skins',
          'js/hugerte/icons',
          'js/hugerte/themes',
          'js/hugerte/models',
          'js/hugerte/license.txt'
        ]
      },

      component: {
        options: {
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.svg',
            'js/**/*.dev.js',
            'js/**/*.map',
            'js/hugerte/hugerte.full.min.js',
            'js/hugerte/plugins/moxiemanager',
            'js/hugerte/plugins/example',
            'js/hugerte/plugins/example_dependency',
            'js/hugerte/plugins/visualblocks/img'
          ],
          pathFilter: function (zipFilePath) {
            if (zipFilePath.indexOf('js/hugerte/') === 0) {
              return zipFilePath.substr('js/hugerte/'.length);
            }

            return zipFilePath;
          },
          onBeforeSave: function (zip) {
            function jsonToBuffer(json) {
              return new Buffer(JSON.stringify(json, null, '\t'));
            }

            const keywords = ['wysiwyg', 'hugerte', 'richtext', 'javascript', 'html', 'text', 'rich editor', 'rich text editor', 'rte', 'rich text', 'contenteditable', 'editing']

            zip.addData('bower.json', jsonToBuffer({
              'name': 'hugerte',
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'license': 'MIT',
              'keywords': keywords,
              'homepage': 'https:/hugerte.org/',
              'ignore': ['README.md', 'composer.json', 'package.json', '.npmignore', 'CHANGELOG.md']
            }));

            zip.addData('package.json', jsonToBuffer({
              'name': 'hugerte',
              'version': packageData.version,
              'repository': {
                'type': 'git',
                'url': 'https://github.com/hugerte/hugerte.git',
                'directory': 'modules/hugerte'
              },
              'funding': {
                'type': 'opencollective',
                'url': 'https://opencollective.com/hugerte'
              },
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'author': 'HugeRTE contributors',
              'main': 'hugerte.js',
              'types': 'hugerte.d.ts',
              'license': 'MIT',
              'keywords': keywords,
              'homepage': 'https://hugerte.org/',
              'bugs': { 'url': 'https://github.com/hugerte/hugerte/issues' }
            }));

            zip.addData('composer.json', jsonToBuffer({
              'name': 'hugerte/hugerte',
              'version': packageData.version,
              'description': 'Web based JavaScript HTML WYSIWYG editor control.',
              'license': ['MIT'],
              'keywords': keywords,
              'homepage': 'https://hugerte.org/',
              'type': 'component',
              'funding': [
                {
                  'type': 'opencollective',
                  'url': 'https://opencollective.com/hugerte'
                }
              ],
              'extra': {
                'component': {
                  'scripts': [
                    'hugerte.js',
                    'plugins/*/plugin.js',
                    'themes/*/theme.js',
                    'models/*/model.js',
                    'icons/*/icons.js',
                  ],
                  'files': [
                    'hugerte.min.js',
                    'plugins/*/plugin.min.js',
                    'themes/*/theme.min.js',
                    'models/*/model.min.js',
                    'skins/**',
                    'icons/*/icons.min.js'
                  ]
                }
              },
              'archive': {
                'exclude': ['README.md', 'bower.js', 'package.json', '.npmignore', 'CHANGELOG.md']
              }
            }));

            var getDirs = zipUtils.getDirectories(grunt, this.excludes);

            zipUtils.addIndexFiles(
              zip,
              getDirs('js/hugerte/plugins'),
              zipUtils.generateIndex('plugins', 'plugin')
            );
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/hugerte/themes'),
              zipUtils.generateIndex('themes', 'theme')
            );
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/hugerte/models'),
              zipUtils.generateIndex('models', 'model')
            );
            zipUtils.addIndexFiles(
              zip,
              getDirs('js/hugerte/icons'),
              zipUtils.generateIndex('icons', 'icons')
            );
          },
          to: 'dist/hugerte_<%= pkg.version %>_component.zip',
          dataFilter: (args) => {
            if (args.filePath.endsWith('.min.css')) {
              args.data = stripSourceMaps(args.data);
            }
          }
        },
        src: [
          'js/hugerte/skins',
          'js/hugerte/icons',
          'js/hugerte/plugins',
          'js/hugerte/themes',
          'js/hugerte/models',
          'js/hugerte/hugerte.js',
          'js/hugerte/hugerte.d.ts',
          'js/hugerte/hugerte.min.js',
          'js/hugerte/license.txt',
          'CHANGELOG.md',
          'js/hugerte/README.md'
        ]
      }
    },

    nugetpack: {
      main: {
        options: {
          id: 'HugeRTE',
          version: packageData.version,
          authors: 'HugeRTE contributors',
          description: 'The best WYSIWYG editor! HugeRTE is an open source platform independent web based Javascript HTML WYSIWYG editor ' +
          'control forked by the HugeRTE contributors from the latest MIT-licensed version of the TinyMCE editor released by Tiny Technologies, Inc. ' +
          'HugeRTE has the ability to convert HTML TEXTAREA fields or other HTML elements to editor instances. HugeRTE is very easy to integrate ' +
          'into other Content Management Systems.',
          releaseNotes: 'http://hugerte.org/docs/hugerte/1/changelog',
          summary: 'HugeRTE is a platform independent web based Javascript HTML WYSIWYG editor ' +
          'control released as Open Source under MIT.',
          projectUrl: 'https://hugerte.org/',
          //iconUrl: 'https://www.tiny.cloud/favicon-32x32.png',
          licenseUrl: 'https://github.com/hugerte/hugerte/blob/main/LICENSE.TXT',
          requireLicenseAcceptance: true,
          tags: 'Editor HugeRTE HTML HTMLEditor',
          excludes: [
            'js/**/config',
            'js/**/scratch',
            'js/**/classes',
            'js/**/lib',
            'js/**/dependency',
            'js/**/src',
            'js/**/*.less',
            'js/**/*.dev.svg',
            'js/**/*.dev.js',
            'js/**/*.map',
            'js/hugerte/hugerte.full.min.js'
          ],
          outputDir: 'dist'
        },
        files: [
          { src: 'js/hugerte/langs', dest: '/content/scripts/hugerte/langs' },
          { src: 'js/hugerte/plugins', dest: '/content/scripts/hugerte/plugins' },
          { src: 'js/hugerte/themes', dest: '/content/scripts/hugerte/themes' },
          { src: 'js/hugerte/models', dest: '/content/scripts/hugerte/models' },
          { src: 'js/hugerte/skins', dest: '/content/scripts/hugerte/skins' },
          { src: 'js/hugerte/icons', dest: '/content/scripts/hugerte/icons' },
          { src: 'js/hugerte/hugerte.js', dest: '/content/scripts/hugerte/hugerte.js' },
          { src: 'js/hugerte/hugerte.d.ts', dest: '/content/scripts/hugerte/hugerte.d.ts' },
          { src: 'js/hugerte/hugerte.min.js', dest: '/content/scripts/hugerte/hugerte.min.js' },
          { src: 'js/hugerte/license.txt', dest: '/content/scripts/hugerte/license.txt' },
          { src: 'tools/nuget/build/HugeRTE.targets', dest: '/build/HugeRTE.targets' }
        ]
      },
    },

    bundle: {
      minified: {
        options: {
          themesDir: 'js/hugerte/themes',
          modelsDir: 'js/hugerte/models',
          pluginsDir: 'js/hugerte/plugins',
          iconsDir: 'js/hugerte/icons',
          pluginFileName: 'plugin.min.js',
          themeFileName: 'theme.min.js',
          modelFileName: 'model.min.js',
          iconsFileName: 'icons.min.js',
          outputPath: 'js/hugerte/hugerte.full.min.js'
        },

        src: [
          'js/hugerte/hugerte.min.js'
        ]
      },

      source: {
        options: {
          themesDir: 'js/hugerte/themes',
          modelsDir: 'js/hugerte/models',
          pluginsDir: 'js/hugerte/plugins',
          iconsDir: 'js/hugerte/icons',
          pluginFileName: 'plugin.js',
          themeFileName: 'theme.js',
          modelFileName: 'model.js',
          iconsFileName: 'icons.js',
          outputPath: 'js/hugerte/hugerte.full.js'
        },

        src: [
          'js/hugerte/hugerte.js'
        ]
      }
    },

    symlink: {
      options: {
        overwrite: true,
        force: true
      },
      dist: {
        src: 'dist',
        dest: '../../dist'
      },
      js: {
        src: 'js',
        dest: '../../js'
      }
    },

    clean: {
      dist: ['js'],
      lib: ['lib'],
      scratch: ['scratch'],
      release: ['dist']
    },

    'bedrock-manual': {
      core: {
        config: 'tsconfig.json',
        projectdir: '.',
        stopOnFailure: true,
        testfiles: [
          'src/**/test/ts/atomic/**/*Test.ts',
          'src/**/test/ts/browser/**/*Test.ts',
          'src/**/test/ts/headless/**/*Test.ts'
        ],
        customRoutes: 'src/core/test/json/routes.json'
      },
      atomic: {
        config: 'tsconfig.json',
        projectdir: '.',
        stopOnFailure: true,
        testfiles: [
          'src/**/test/ts/atomic/**/*Test.ts',
        ],
        customRoutes: 'src/core/test/json/routes.json'
      },
      silver: {
        config: 'tsconfig.json',
        testfiles: ['src/themes/silver/test/ts/phantom/**/*Test.ts', 'src/themes/silver/test/ts/browser/**/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'silver-tests'
      }
    },

    'bedrock-auto': {
      standard: {
        browser: grunt.option('bedrock-browser') !== undefined ? grunt.option('bedrock-browser') : 'chrome-headless',
        config: 'tsconfig.json',
        testfiles: ['src/**/test/ts/**/*Test.ts'],
        overallTimeout: 900000,
        singleTimeout: 30000,
        retries: 3,
        customRoutes: 'src/core/test/json/routes.json',
        name: grunt.option('bedrock-browser') !== undefined ? grunt.option('bedrock-browser') : 'chrome-headless'
      },
      silver: {
        browser: 'phantomjs',
        config: 'tsconfig.json',
        testfiles: ['src/themes/silver/test/ts/phantom/**/*Test.ts', 'src/themes/silver/test/ts/browser/**/*Test.ts', 'src/themes/silver/test/ts/webdriver/*/*Test.ts'],
        stopOnFailure: true,
        overallTimeout: 600000,
        singleTimeout: 300000,
        customRoutes: 'src/core/test/json/routes.json',
        name: 'silver-tests'
      }
    }
  });

  grunt.registerTask('symlink-dist', 'Links built dist content to the root directory', function () {
    // Windows doesn't support symlinks, so copy instead of linking
    if (process.platform === "win32") {
      if (grunt.file.exists('../../dist')) grunt.file.delete('../../dist', { force: true });
      if (grunt.file.exists('../../js')) grunt.file.delete('../../js', { force: true });
      grunt.file.copy('dist', '../../dist');
      grunt.file.copy('js', '../../js');
      grunt.log.write('Copied 2 directories');
    } else {
      grunt.task.run('symlink');
    }
  });

  grunt.registerTask('version', 'Creates a version file', function () {
    grunt.file.write('dist/version.txt', packageData.version);
  });

  require('load-grunt-tasks')(grunt, {
    requireResolution: true,
    config: "../../package.json",
    pattern: ['grunt-*', '@ephox/bedrock-server', '@ephox/swag']
  });
  grunt.loadTasks('tools/tasks');

  grunt.registerTask('emoji', ['emojis', 'terser:emoticons-raw']);

  grunt.registerTask('prodBuild', [
    'shell:prismjs',
    'shell:tsc',
    //'eslint',
    'globals',
    'emoji',
    'html-i18n',
    'rollup',
    'concat',
    'copy',
    'terser'
  ]);

  grunt.registerTask('prod', [
    'prodBuild',
    'clean:release',
    'moxiezip',
    'nugetpack',
    'symlink-dist',
    'version'
  ]);

  grunt.registerTask('dev', [
    'shell:prismjs',
    'globals',
    'emoji',
    'html-i18n',
    // TODO: Make webpack use the oxide CSS directly
    // as well as making development easier, then we can update 'yarn dev' to run 'oxide-build' in parallel with 'hugerte-grunt dev'
    // that will save 2-3 seconds on incremental builds
    'copy:ui-skins',
    'copy:content-skins',
    'copy:default-icons',
    'copy:html-i18n'
  ]);

  grunt.registerTask('start', ['webpack-dev-server']);

  grunt.registerTask('default', ['clean:dist', 'prod']);
  grunt.registerTask('test', ['bedrock-auto:standard']);
  grunt.registerTask('test-manual', ['bedrock-manual']);
};
