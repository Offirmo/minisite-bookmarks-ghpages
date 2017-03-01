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

	// http://requirejs.org/docs/api.html#config-waitSeconds
	waitSeconds: 30, // FF has trouble with the default. Strange...

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
		/////// shim plugins (autogenerated !)
		'@offirmo/rx-auto': 'dist/third-party/offirmo.rx-auto@0',
		'@reactivex/rxjs': 'dist/third-party/reactivex.rxjs.rx@5',
		'FitText-UMD': 'dist/third-party/fittext-umd.fittext@1',
		'js-yaml': 'dist/third-party/js-yaml@3',
		'lodash': 'dist/third-party/lodash@4',
		'packery': 'dist/third-party/packery.pkgd@2',
		'randomcolor': 'dist/third-party/randomcolor.randomcolor@0',
		'require-css': 'dist/third-party/require-css.css@0',
		'requirejs': 'dist/third-party/requirejs@2',
		'shave': 'dist/third-party/shave@1',
		'tachyons': 'dist/src.es7.amd/empty',
		'tslib': 'dist/third-party/tslib@1',
		'typescript-string-enums': 'dist/third-party/typescript-string-enums@0',
		'when-dom-ready': 'dist/third-party/when-dom-ready.index.umd@1',
	},


	/////////////////////
	shim: {
		/////// shim plugins
		'lodash': {
			exports: '_'
		},
		'tachyons': {
			deps: [
				'css!dist/third-party/tachyons@4.css'
			]
		},
		'typescript-string-enums': {
//			exports: 'Enum',
			init: function (this: any) {
				return {
					Enum: this.Enum
				}
			}
		},
	},

	/////////////////////
	config: {
	},

	/////////////////////
	// dependencies to load as soon as require.js defines require
	deps: [ ],
})