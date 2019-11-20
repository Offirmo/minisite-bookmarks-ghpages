"use strict";
/** require.js config
 *
 * Note : for the optimizer to work correctly :
 *  - no "code"
 *  - no fancy stuff
 */
requirejs.config({
    // base URL from which component files will be searched
    // NOTE 1 : non-rsrc url below may not be affected by baseUrl
    // NOTE 2 : relative baseUrl base refers to *the calling html* !
    baseUrl: '.',
    // http://requirejs.org/docs/api.html#config-enforceDefine
    enforceDefine: false,
    // http://requirejs.org/docs/api.html#config-waitSeconds
    waitSeconds: 30,
    map: {
        '*': {
            css: 'dist/third-party/require-css.css@0.js',
        }
    },
    /////////////////////
    // multi-files modules
    packages: [
        {
            name: 'app',
            location: 'dist/src.es7.amd',
            main: 'index.js',
        },
        {
            name: '@offirmo/rx-auto',
            location: 'node_modules/@offirmo/rx-auto/dist/es2017.umd',
            main: 'index.js',
        },
    ],
    /////////////////////
    paths: {
        /////// shim plugins (autogenerated !)
        //'@offirmo/rx-auto': 'dist/third-party/offirmo.rx-auto@0',
        '@offirmo/simple-querystring-parser': 'dist/third-party/offirmo.simple-querystring-parser@1',
        '@reactivex/rxjs': 'dist/third-party/reactivex.rxjs.rx@5',
        'chroma-js': 'dist/third-party/chroma-js.chroma@1',
        'lodash': 'dist/third-party/lodash@4',
        'marky': 'dist/third-party/marky@1',
        'packery': 'dist/third-party/packery.pkgd@2',
        'require-css': 'dist/third-party/require-css.css@0',
        'requirejs': 'dist/third-party/requirejs@2',
        'tachyons': 'dist/src.es7.amd/empty',
        'tslib': 'dist/third-party/tslib@1',
        'typescript-string-enums': 'dist/third-party/typescript-string-enums@1',
        /////// our app, as a module, so that we can reference it when inside the bundle
        'app-mod': 'src/index',
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
            init: function () {
                return {
                    Enum: this.Enum
                };
            }
        },
    },
    /////////////////////
    config: {},
    /////////////////////
    // dependencies to load as soon as require.js defines require
    deps: [],
});
//# sourceMappingURL=requirejs-config.js.map