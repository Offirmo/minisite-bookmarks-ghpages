////////////////////////////////////

import * as _ from 'lodash'
import RandomColor = require('randomcolor')
import { Enum } from 'typescript-string-enums'

////////////////////////////////////

const UrlCategory1 = Enum(
	'special', // not internet, ex. chrome settings, ftp...
	'pro', // .com, .co.xyz, .biz
	'geek', // .net, .io
	'perso',
	'other'
)
type UrlCategory1 = Enum<typeof UrlCategory1>

interface UrlCategories {
	cat1: UrlCategory1
}

const RandomColorHue = Enum(
	'red', // note: too strong, do not use
	'orange',
	'yellow', // ~ "work sign" -> tech, geek
	'green',
	'blue', // "pro"
	'purple',
	'pink',
	'monochrome' // special
)
type RandomColorHue = Enum<typeof RandomColorHue>

const RandomColorLuminosity = Enum('bright', 'light', 'dark')
type RandomColorLuminosity = Enum<typeof RandomColorLuminosity>

////////////////////////////////////

function get_colors() {
	const colors = {}

	/*
	RANDOMCOLOR_CONSTS.hues.forEach(hue => {
		const by_lum = colors[hue] = {}

	})*/

	return colors
}

function get_RandomColor_luminosity_for(parsed_url: URL, cats: UrlCategories): RandomColorLuminosity {
	return RandomColorLuminosity.light
}

function get_RandomColor_hue_for(parsed_url: URL, cats: UrlCategories): RandomColorHue {
	switch (cats.cat1) {
		case 'pro':
			return RandomColorHue.blue
		case 'geek':
			return RandomColorHue.yellow
		case 'other':
			// TODO spread
			return RandomColorHue.green
		case 'perso':
			// TODO spread
			return RandomColorHue.pink

		case 'special':
			/* fall through */
		default:
			return RandomColorHue.monochrome
	}
}

function select_color_for_url(parsed_url: URL): string {
	const { hostname, protocol } = parsed_url

	let cat1: UrlCategory1 = 'other'


	switch (hostname.slice(-5)) {
		case '.name':
			cat1 = UrlCategory1.perso
			break
		default:
			break
	}

	switch (hostname.slice(-4)) {
		case '.biz':
		case '.com':
		case '.pro':
		case '.edu':
			cat1 = UrlCategory1.pro
			break
		case '.net':
			cat1 = UrlCategory1.geek
			break
		default:
			break
	}

	switch (hostname.slice(-3)) {
		case '.io':
			cat1 = UrlCategory1.geek
			break
		case '.me':
			cat1 = UrlCategory1.perso
			break
		default:
			break
	}

	// other special cases
	if (hostname.slice(-6, -3) === '.co.')
		cat1 = UrlCategory1.pro

	if (protocol !== 'https:' && protocol !== 'http:')
		cat1 = UrlCategory1.special

	if (hostname === 'github.com')
		cat1 = UrlCategory1.geek

	return RandomColor({
		luminosity: get_RandomColor_luminosity_for(parsed_url, {cat1}),
		hue: get_RandomColor_hue_for(parsed_url, {cat1}),
	})
}


function generate_label_from_url(parsed_url: URL): string {
	let candidate_label = parsed_url.href

	// remove low-interest infos / "noise" to make the label smaller
	if (parsed_url.protocol !== 'https:' && parsed_url.protocol !== 'http:') {
		// don't touch anything
	}
	else {
		// remove the protocol
		candidate_label = parsed_url.host + parsed_url.pathname
	}

	if (candidate_label.endsWith('/'))
		candidate_label = candidate_label.slice(0, -1)

	if (candidate_label.startsWith('www.'))
		candidate_label = candidate_label.slice(4)

	return candidate_label
}

////////////////////////////////////

export {
	generate_label_from_url,
	select_color_for_url,
}
