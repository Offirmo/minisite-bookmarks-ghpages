

http://fontawesome.io/get-started/

Awesome trick from Lea Verou
http://lea.verou.me/2016/11/url-rewriting-with-github-pages/

http://lea.verou.me/2013/11/flexible-google-style-loader-with-css/


## use you secret key on https://gchq.github.io/CyberChef/
https://gchq.github.io/CyberChef/?recipe=%5B%7B%22op%22%3A%22AES%20Encrypt%22%2C%22args%22%3A%5B%7B%22option%22%3A%22UTF8%22%2C%22string%22%3A%22secret%22%7D%2C%7B%22option%22%3A%22Hex%22%2C%22string%22%3A%22%22%7D%2C%7B%22option%22%3A%22Hex%22%2C%22string%22%3A%22%22%7D%2C%22CBC%22%2C%22Pkcs7%22%2C%22Show%20all%22%2C%22Hex%22%5D%7D%5D


Packery
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/4869992bc079b88280b9ff91213528904109e8ae/packery/packery-tests.ts
https://www.gnu.org/licenses/gpl-faq.html#CombinePublicDomainWithGPL


github pages hosted lists
- stored in markdown
- tiles with different sizes (http://packery.metafizzy.co/layout.html)
- icons from site
  https://github.com/mat/besticon
  https://icons.better-idea.org/popular
- progressive
- https://polyfill.io/v2/docs/
- groups
- https://github.com/Haonancx/CSS3-Loader


https://dollarshaveclub.github.io/shave/


A tester:
https://github.com/tomhodgins/quark/

Flow
####

entries:
- ocurrent vault ID
- os_ : fresh config
-     : fresh content (markdown)
-     : cached config
-     : cached content
-     : parsed config
-     : parsed content
-     : password


	//const module_name = dep_path.startsWith('@') ? dep_path.split('/').slice(0, 2).join('/') : dep_path.split('/')[0]


/*const NEEDED_MODULES = [
	'@offirmo/rx-auto',
	'@reactivex/rxjs',
	'js-yaml',
	'packery',
	'require-css',
	'requirejs',
	'shave',
	'tachyons',
	'tslib',
	'typescript-string-enums',
	'when-dom-ready' ]*/

	const NEEDED_FILES_FROM_MODULESx = NEEDED_MODULES.map(mod => require(`${mod}/package.json`).main)
   console.info(NEEDED_FILES_FROM_MODULESx)

   const NEEDED_FILES_FROM_MODULES = [
   	// order matters !
   	'requirejs/require.js',
   	'require-css/css.js',
   	'tachyons/css/tachyons.css',
   	'lodash/lodash.js',
   	'tslib/tslib.js',
   	'packery/dist/packery.pkgd.js',
   	'js-yaml/dist/js-yaml.js',
   	'typescript-string-enums/dist/index.js',
   	'@reactivex/rxjs/dist/global/Rx.js',
   	'@offirmo/rx-auto/dist/es6.umd/index.js',
   ]



		/*
		'@offirmo/rx-auto': 'dist/third-party/offirmo.rx-auto@0',
		'@reactivex/rxjs' : 'dist/third-party/reactivex.rxjs.rx@5',
		'js-yaml' : 'dist/third-party/js-yaml@3',
		'lodash'  : 'dist/third-party/lodash@4',
		'packery' : 'dist/third-party/packery.pkgd@2',
		'tachyons': 'dist/src.es7.amd/empty',
		'tslib'   : 'dist/third-party/tslib@1',
		'typescript-string-enums': 'dist/third-party/typescript-string-enums@0',
		*/
		/*
		'extended-exceptions'      : 'bower_components/extended-exceptions.js/extended_exceptions',
		'javascript-state-machine' : 'bower_components/javascript-state-machine/state-machine',
		'rx'                       : 'bower_components/rxjs/dist/rx.all',
		*/
