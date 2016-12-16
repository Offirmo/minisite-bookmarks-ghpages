/** require.js config
 *
 * Note : for the optimizer to work correctly :
 *  - no "code"
 *  - no fancy stuff
 */

declare var requirejs: any
requirejs.config({

	// base URL from which component files will be searched
	// NOTE 1 : non-rsrc url below may not be affected by baseUrl
	// NOTE 2 : relative baseUrl base refers to *the calling html* !
	baseUrl: '.',

	// http://requirejs.org/docs/api.html#config-enforceDefine
	enforceDefine: false,

	map: {
		'*': {
			css: 'dist/third-party/require-css.css@0.js',
		}
	},


	/////////////////////
	// multi-files modules
	packages: [
		{
			name : 'app',
			location: 'dist/src.es7.amd',
		},
	],

	/////////////////////
	paths: {
		/////// shim plugins
		packery: 'dist/third-party/packery.pkgd@2',
		tachyons: 'dist/src.es7.amd/empty',

		/*
		'extended-exceptions'      : 'bower_components/extended-exceptions.js/extended_exceptions',
		'javascript-state-machine' : 'bower_components/javascript-state-machine/state-machine',
		'lodash'                   : 'bower_components/lodash/lodash',
		'rx'                       : 'bower_components/rxjs/dist/rx.all',
		*/
	},


	/////////////////////
	shim: {
		/////// shim plugins
		lodash: {
			exports: '_'
		},
		tachyons: {
			deps: [
				'css!dist/third-party/tachyons@4.css'
			]
		},
	},

	/////////////////////
	config: {
	},

	/////////////////////
	// dependencies to load as soon as require.js defines require
	deps: [ ],
})
