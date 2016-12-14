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
	enforceDefine: true,

	map: {
		'*': {
			//'css': 'bower_components/require-css/css',
			//'json': 'bower_components/requirejs-plugins/src/json',
			//'css-builder': 'bower_components/require-css/css-builder',
			//'normalize': 'bower_components/require-css/normalize',
			// a require.js extension to be able to load less stylesheets with require.js
			//'less': 'bower_components/require-less/less',
			// a require.js extension to be able to load dust.js templates easily
			//'rdust': 'bower_components/require-dust/rdust',
			// a require.js extension to be able to wait for the DOM to be ready
			//'domReady': 'bower_components/requirejs-domready/domReady',
			// an extension to lazy load angular components
			//'ngload': 'bower_components/angularAMD/ngload',
			// transparently replace underscore with lodash
			//'underscore' : 'lodash'
		}
	},

	/////////////////////
	// multi-files modules
	packages: [
		/*{ // require.js extensions (plugin) to be able to load css with require.js
			name : 'css',
			location: 'bower_components/require-css/',
			main: 'css.js'
		},*/
		{
			name : 'boringrpg',
			location: 'client/apps/boringrpg/'
		},
		{
			name : 'when',
			location: 'bower_components/when',
			main: 'when.js'
		},
	],

	/////////////////////
	paths: {

		/////// our apps, as modules, so that we can reference them when inside the concat+min js
		'app-index'                : 'client/apps/index/index',

		/////// shim plugins
		'appcache-nanny'           : 'bower_components/appcache-nanny/appcache-nanny',
		// dust-full : this plugin MUST be aliased 'dust' for rdust to work properly, see 'dust' below
		'dust'                     : 'bower_components/dustjs-linkedin/dist/dust-full',
		'dust-helpers'             : 'bower_components/dustjs-linkedin-helpers/dist/dust-helpers',
		'extended-exceptions'      : 'bower_components/extended-exceptions.js/extended_exceptions',
		'javascript-state-machine' : 'bower_components/javascript-state-machine/state-machine',
		'lodash'                   : 'bower_components/lodash/lodash',
		'rx'                       : 'bower_components/rxjs/dist/rx.all',
	},


	/////////////////////
	shim: {
		/////// require.js extensions

		/////// AMD plugins

		/////// shim plugins
		lodash: {
			exports: '_'
		}
	},

	/////////////////////
	config: {
	},

	/////////////////////
	// dependencies to load as soon as require.js defines require
	deps: [ ],
})

console.log('Loaded require.js config.')
