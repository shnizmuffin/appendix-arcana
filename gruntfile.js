module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		//grunt-beep
		//https://www.npmjs.org/package/grunt-beep
		// It beeps
		beep: {
		},
		//grunt-contrib-sass
		//https://github.com/gruntjs/grunt-contrib-sass
		//Compiles SASS and SCSS files into CSS
		sass: {
			dist: {
				options: {

					// Prepend the specified string to the output file. Useful for licensing information. Can't be used if sourcemap option is true.
					//banner: '',								 

					// run SASS with bundle exec (http://bundler.io/)
					// bundleExec: false,  

					// filepath to the SASS cache.
					//cacheLocation: '.sass-cache',

					// Checks for syntax errors without compiling.
					check: false,

					// Makes Compass imports available and loads project configuration. (config.rb must be in same dir as gruntfile.js)
					compass: false,

					// Emits extra information in the generated CSS that can be used by the FireSass Firebug plugin.
					debugInfo: false,

					// Emit comments in the generated CSS indicating the corresponding source line.
					lineNumbers: false,

					// String or Array of SASS import paths.
					//loadPath: '',								 

					// Turns off caching.
					noCache: false,

					// Specifies digits of precision when outputting decimals.
					precision: '3',

					// Silences warnings and status messages during compilation.
					quiet: false,

					// String or Array of Ruby libraries to load before running SASS.
					//require:'',

					// Generates sourcemap. (Requires bleeding edge of SASS 3.3.0)
					//sourcemap: 'false',

					// Determines style of compiled CSS file. (HUGE <-- expanded, nested, compact, compressed --> TINY)
					style: 'nested',

					// Show a full traceback on error.
					trace: false
				},

				// Directory of CSS/SASS/SCSS Files
				files: {
					'css/<%= pkg.name %>.scss.css':'css/<%= pkg.name %>.scss'
				}
			}
		},
		//grunt-autoprefixer
		//
		//Goes to CanIUse and prefixes our properties so we don't have to.
		autoprefixer: {
			options: {
				browsers: ['last 2 version', 'ie 9']
			},
			styles: {
				src: 'css/<%= pkg.name %>.scss.css',
				dest: 'css/<%= pkg.name %>.css'
			}
		},
		//grunt-csscomb
		//https://www.npmjs.org/package/grunt-csscomb
		//It organizes CSS properties based on a specified order
		csscomb: {
			options: {
				config: 'css/.csscomb.json'
			},
			dist: {
				files: {
					//destination : source
				    'css/<%= pkg.name %>.css': 'css/<%= pkg.name %>.css',
				}
			}
		},
		//grunt-contrib-csslint
		//https://github.com/gruntjs/grunt-contrib-csslint
		// It checks CSS for syntax errors and OOCSS best practices
		csslint: {
			// setting value to false ignores the rule
			// setting value to 2 reports as an error
			// default value reports as warning
			options:{
				//"important":true,
				//"adjoining-classes":true,
				//"known-properties":true,
				"box-sizing":false,                 //Inuit uses global border-box
				"box-model":false,                  //Inuit uses global border-box
				//"overqualified-elements":true,
				//"display-property-grouping":true,
				//"bulletproof-font-face":true,
				"compatible-vendor-prefixes":false, //Autoprefixer handles this
				//"regex-selectors":true,
				//"errors":true,
				//"duplicate-background-images":true,
				//"duplicate-properties":true,
				//"empty-rules":true,
				//"selector-max-approaching":true,
				//"gradients":true,
				//"fallback-colors":true,
				//"font-sizes":true,
				//"font-faces":true,
				//"floats":true,
				//"star-property-hack":true,
				//"outline-none":true,
				//"import":true,
				//"ids":true,
				//"underscore-property-hack":true,
				//"rules-count":true,
				//"qualified-headings":true,
				//"selector-max":true,
				//"shorthand":true,
				//"text-indent":true,
				//"unique-headings":true,
				//"universal-selector":true,
				//"unqualified-attributes":true,
				//"vendor-prefix":true,
				//"zero-units":true
			},
			strict: {
				options: {
					"import": 2,
					"font-sizes":true,  // our font-face mixin doubles this # as part of a fallback.
					"outline-none":true // there should only be one warning, though.
				},
				src: ['css/<%= pkg.name %>.css']
			},
			lax: {
				options: {
					"import": false,
					"important": false,
					"unique-headings":false,
					"unqualified-attributes":false,
					"regex-selectors":false,
					"outline-none":false,
					"universal-selector":false,
					"font-sizes":false
				},
				src: ['css/<%= pkg.name %>.css']
			}
		},
		//grunt-contrib-jshint
		//https://github.com/gruntjs/grunt-contrib-jshint
		// It checks JS for errors and potential problems
		jshint: {
			options:{
				  "asi"      : true,
				  "boss"     : true,
				  "browser"  : true,
				  "debug"    : true,
				  "devel"    : true,
				  "eqeqeq"   : false,
				  "eqnull"   : true,
				  "expr"     : true,
				  "indent"   : 2,
				  "laxbreak" : true,
				  "quotmark" : "single",
				  "validthis": true
			}
		},
		//grunt-contrib-concat
		//https://github.com/gruntjs/grunt-contrib-concat
		//It builds one JS file from many JS files
		concat:{
		},
		//grunt-contrib-cssmin
		//https://npmjs.org/package/grunt-contrib-cssmin
		//It minifies CSS
		cssmin:{
			mini:{
				options:{
					report: 'min'
				},
				files: {
					// 'path/to/destination' : 'path/to/source'
					//'css/style.min.css':'css/style.css'
				}
			}
		},
		//grunt-contrib-watch
		//https://github.com/gruntjs/grunt-contrib-watch
		//It fires tasks when files change
		watch:{
			scripts:{
				//path to source scripts
				files: ['**/*.js'],
				tasks: ['jshint','beep']
			},
			styles:{
				//path to source styles
				files: ['**/*.scss'],
				tasks: ['sass', 'autoprefixer', 'csscomb', 'csslint:lax', 'beep']
			}
		}
	});

	// Load the plugins that provide tasks.
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-beep');
	grunt.loadNpmTasks('grunt-csscomb');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-autoprefixer');

	// Register tasks
	// This is what happens when you only type "grunt"
	grunt.registerTask('default', ['beep']);
	grunt.registerTask('dev-styles', ['watch:styles']);
	grunt.registerTask('dev-scripts', ['watch:scripts']);

};
