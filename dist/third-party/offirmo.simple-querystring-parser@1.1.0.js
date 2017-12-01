// UMD template from https://gist.github.com/Offirmo/ec5c7ec9c44377c202f9f8abcacf1061#file-umd-js
(function (root, factory) {
	var LIB_NAME = 'SimpleQuerystringParser'
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(function () {
			return (root
				? root[LIB_NAME] = factory()
				: factory() // root is not defined in webpack 2, but this works
			)
		});
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory()
	} else if (root) {
		// Browser globals
		root[LIB_NAME] = factory()
	} else {
		throw new Error('From UMD wrapper of lib "' + LIB_NAME + '": unexpected env, cannot expose my content!')
	}
}(this, function () {
	"use strict";

	function lightQuerystringValueDecoder(val) {
		// A bare parameter, is likely to mean true, like ?showUsers
		// WARNING this is a voluntary departure from the standard http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		if (typeof val !== 'string')
			return true

		if (val.match(/^[0-9]+$/))
			return Number(val)

		if (val === 'true')
			return true

		if (val === 'false')
			return false

		return val // no inference
	}

	function parse(querystring, options) {
		options = options || {}
		options.valueDecoder = options.valueDecoder || lightQuerystringValueDecoder
		// Create an object with no prototype https://github.com/sindresorhus/query-string/issues/47
		var result = Object.create(null)

		if (typeof querystring !== 'string')
			return result

		// remove possible leading char, whatever it may be
		querystring = querystring.trim().replace(/^(\?|#|&)/, '');

		if (!querystring)
			return result

		var raw_options = querystring.split('&')
		return raw_options.reduce(function (acc, raw_option) {
			if (!raw_option) return acc

			var split = raw_option.split('=')
			var key = decodeURIComponent(split[0])
			var value = decodeURIComponent(split.slice(1).join('=')) || undefined
			acc[key] = options.valueDecoder(value)
			return acc
		}, result)
	}

	function parseLocationParams(location, options) {
		return parse(location.search, options)
	}

	return {
		parse: parse,
		parseLocationParams: parseLocationParams,
		lightQuerystringValueDecoder: lightQuerystringValueDecoder
	}
}))
