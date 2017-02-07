#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"
'use strict';

const path = require('path')

const semver = require('semver')
const fs = require('@offirmo/cli-toolbox/fs/extra')

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

const MANAGED_MODULES_DIR = 'node_modules'
const SOURCE_CONTROLLED_THIRD_PARTY_DIR = 'dist/third-party'

fs.emptyDirSync(SOURCE_CONTROLLED_THIRD_PARTY_DIR)

let header_deps = ''

function log() {
	if (false) console.log(...arguments)
}

NEEDED_FILES_FROM_MODULES.forEach(dep_path => {
	const module_name = dep_path.startsWith('@') ? dep_path.split('/').slice(0, 2).join('/') : dep_path.split('/')[0]
	log('module name:', module_name)

	const module_version = semver.clean(require(`${module_name}/package.json`).version)
	log('module version:', module_version)

	const id = (module_name.endsWith('.js') ? module_name.slice(0, -3) : module_name)
		.split('/')
		.map(s => s.startsWith('@') ? s.slice(1) : s)
		.join('.')
	log('(computed) id:', id)

	const dep_path_parsed = path.parse(dep_path)
	log(dep_path_parsed)

	let target_radix = dep_path_parsed.name
	// cases were information is redondant / superfluous
	if (target_radix === 'index') target_radix = id // cause adds no info
	if ((target_radix + dep_path_parsed.ext.slice(1)) === id) target_radix = id // case like requirejs/require.js
	// cases were information is missing
	if (! target_radix.includes(id)) target_radix = id + '.' + target_radix
	// uniformize
	target_radix = target_radix.slice(target_radix.indexOf(id)).toLocaleLowerCase()
	log('target_radix:', target_radix)

	let target_filename = target_radix + '@' + module_version + dep_path_parsed.ext
	let target_filename_major = target_radix + '@' + semver.major(module_version) + dep_path_parsed.ext
	console.log(module_name, module_version, id, target_radix, semver.major(module_version), target_filename, target_filename_major)

	fs.copySync(path.join(MANAGED_MODULES_DIR, dep_path), path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename))
	fs.copySync(path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename), path.join(SOURCE_CONTROLLED_THIRD_PARTY_DIR, target_filename_major))

	if (dep_path_parsed.ext === '.css')
		header_deps += `\n<link rel="stylesheet" type="text/css" href="${SOURCE_CONTROLLED_THIRD_PARTY_DIR}/${target_filename_major}" />`
	else
		header_deps += `\n<script src="${SOURCE_CONTROLLED_THIRD_PARTY_DIR}/${target_filename_major}"></script>`
})
