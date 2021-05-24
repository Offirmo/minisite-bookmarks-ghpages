// https://requirejs.org/docs/optimization.html
// https://github.com/jrburke/r.js/blob/master/build/example.build.js

({
	baseUrl: '../..',
	mainConfigFile: '../../dist/src.es7.amd/requirejs-config.js',
	name: 'app',
	generateSourceMaps: true,
	preserveLicenseComments: false,
	out: '../../dist/bundle-rjs.js',
	optimize: 'none', // uglify doesn't support ES6+ (working on it since 2014…)
})
