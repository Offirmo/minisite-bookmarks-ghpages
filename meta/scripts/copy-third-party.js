#!/bin/sh
':' //# https://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"
'use strict';

const path = require('path')

const semver = require('semver')
const fs = require('@offirmo/cli-toolbox/fs/extra')

function log() {
	if (false) console.log(...arguments)
}

const package_json = require('../../package.json')

const NEEDED_MODULES = Object.keys(package_json.dependencies)
log(NEEDED_MODULES)

const MANAGED_MODULES_DIR = 'node_modules'
const SOURCE_CONTROLLED_THIRD_PARTY_DIR = 'dist/third-party'

fs.emptyDirSync(SOURCE_CONTROLLED_THIRD_PARTY_DIR)


let header_deps = ''
let requirejs_deps = ''

function cleanupModuleNameAndMakeItFilenameFriendly(module_name) {
	return (module_name.endsWith('.js') ? module_name.slice(0, -3) : module_name)
		.split('/')
		.map(s => s.startsWith('@') ? s.slice(1) : s)
		.join('.')
}


NEEDED_MODULES.forEach(module_name => {
	const package_json = require(`${module_name}/package.json`)
	log({module_name})

	let dep_path
	switch(module_name) {
		case '@reactivex/rxjs': dep_path = `${module_name}/dist/global/Rx.js`; break
		case 'js-yaml': dep_path = `${module_name}/dist/js-yaml.js`; break
		case 'marky': dep_path = `${module_name}/dist/marky.js`; break
		case 'packery': dep_path = `${module_name}/dist/packery.pkgd.js`; break
		case 'require-css': dep_path = `${module_name}/css.js`; break
		case 'requirejs': dep_path = `${module_name}/require.js`; break
		default:
			dep_path = `${module_name}/${package_json.main || 'index.js'}`
			break
	}
	log({dep_path})

	const module_version = semver.clean(package_json.version)
	log({module_version})

	const ffid = cleanupModuleNameAndMakeItFilenameFriendly(module_name)
	log({ffid})

	const dep_path_parsed = path.parse(dep_path)
	log(dep_path_parsed)

	let target_radix = dep_path_parsed.name
	// cases were information is redundant / superfluous
	if (target_radix === 'index') target_radix = ffid // cause adds no info
	if ((target_radix + dep_path_parsed.ext.slice(1)) === ffid) target_radix = ffid // case like requirejs/require.js
	// cases were information is missing
	if (! target_radix.includes(ffid)) target_radix = ffid + '.' + target_radix
	// uniformize
	target_radix = target_radix.slice(target_radix.indexOf(ffid)).toLocaleLowerCase()
	log('target_radix:', target_radix)

	let target_filename = target_radix + '@' + module_version + dep_path_parsed.ext
	let target_filename_major = target_radix + '@' + semver.major(module_version) + dep_path_parsed.ext
	console.log({module_name, module_version, dep_path, ffid, target_radix, major: semver.major(module_version), target_filename, target_filename_major})

	fs.copySync(path.join(MANAGED_MODULES_DIR, dep_path), path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename))
	fs.copySync(path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename), path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename_major))

	if (dep_path_parsed.ext === '.css') {
		header_deps += `\n<link rel="stylesheet" type="text/css" href="${SOURCE_CONTROLLED_THIRD_PARTY_DIR}/${target_filename_major}" />`
		requirejs_deps += `\n'${module_name}': 'dist/src.es7.amd/empty',`
	}
	else {
		header_deps += `\n<script src="${SOURCE_CONTROLLED_THIRD_PARTY_DIR}/${target_filename_major}"></script>`
		requirejs_deps += `\n'${module_name}': '${SOURCE_CONTROLLED_THIRD_PARTY_DIR}/${target_filename_major.slice(0, -3)}',`
	}
})

console.log('\nPut that in your header:')
console.log(header_deps)
console.log('\nPut that in your RequireJS config:')
console.log(requirejs_deps)
