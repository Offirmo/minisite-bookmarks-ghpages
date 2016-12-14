/** require.js config
 *
 * Note : for the optimizer to work correctly :
 *  - no "code"
 *  - no fancy stuff
 */
"use strict";
requirejs.config({
    // base URL from which component files will be searched
    // NOTE 1 : non-rsrc url below may not be affected by baseUrl
    // NOTE 2 : relative baseUrl base refers to *the calling html* !
    baseUrl: '.',
    // http://requirejs.org/docs/api.html#config-enforceDefine
    enforceDefine: true,
    map: {
        '*': {}
    },
    /////////////////////
    // multi-files modules
    packages: [],
    /////////////////////
    paths: {
        /////// our apps, as modules, so that we can reference them when inside the concat+min js
        'app': 'dist/src.es7.amd',
        /////// shim plugins
        'appcache-nanny': 'bower_components/appcache-nanny/appcache-nanny',
        // dust-full : this plugin MUST be aliased 'dust' for rdust to work properly, see 'dust' below
        'dust': 'bower_components/dustjs-linkedin/dist/dust-full',
        'dust-helpers': 'bower_components/dustjs-linkedin-helpers/dist/dust-helpers',
        'extended-exceptions': 'bower_components/extended-exceptions.js/extended_exceptions',
        'javascript-state-machine': 'bower_components/javascript-state-machine/state-machine',
        'lodash': 'bower_components/lodash/lodash',
        'rx': 'bower_components/rxjs/dist/rx.all',
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
    config: {},
    /////////////////////
    // dependencies to load as soon as require.js defines require
    deps: [],
});
console.log('Loaded require.js config.');
//# sourceMappingURL=requirejs-config.js.map