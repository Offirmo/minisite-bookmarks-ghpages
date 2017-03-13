////////////////////////////////////

import * as _ from 'lodash'
import RandomColor = require('randomcolor')
import { Enum } from 'typescript-string-enums'

////////////////////////////////////

const UrlCategory = Enum(
	'pro', // .com, .co.xyz, .biz
	'geek', // .net, .io
	'perso', // .me, .name
	'other',
	'special', // not internet, ex. chrome settings, ftp...
)
type UrlCategory = Enum<typeof UrlCategory>

const RandomColorHue = Enum(
	'red', // too strong, too frightening, won't use
	'purple', // also too strong

	'orange', // maybe, but connoted to warning

	'yellow', // like a "work sign" -> tech, geek
	'blue', // "pro"
	'green', // good for misc non-pro
	'pink', // good for "snowflake" private sites
	'monochrome' // special
)
type RandomColorHue = Enum<typeof RandomColorHue>

const RandomColorLuminosity = Enum('bright', 'light', 'dark')
type RandomColorLuminosity = Enum<typeof RandomColorLuminosity>

////////////////////////////////////

/*
 const SEED: number = 3712
 const NUMBER_VARIANT_COUNT: number = 100

const get_colors = _.memoize(function get_colors() {
	console.info('Generating colors...')
	const colors = {}

	Object.keys(RandomColorHue).forEach(hue => {
		colors[hue] = RandomColor({
			seed: SEED,
			count: NUMBER_VARIANT_COUNT,
			luminosity: RandomColorLuminosity.light,
			hue: hue as RandomColorHue
		})
	})

	return colors
})

const get_variant_index_for_hostname = _.memoize(function get_hued_variant_index_for_hostname(hostname: string): number {
 return (murmurhash3_32_gc(hostname, SEED) % NUMBER_VARIANT_COUNT)
})
*/

const get_hue_for_category = _.memoize(function get_hue_for_category(cat: UrlCategory): RandomColorHue {
	switch (cat) {
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
})


const get_category_for_url = _.memoize(function get_category1_for_url(hostname: string, protocol: string) {
	let cat: UrlCategory = 'other'

	switch (hostname.slice(-5)) {
		case '.name':
		case '.blog':
			cat = UrlCategory.perso
			break
		default:
			break
	}

	switch (hostname.slice(-4)) {
		case '.biz':
		case '.com':
		case '.pro':
		case '.gov':
		case '.edu':
		case '.mil':
			cat = UrlCategory.pro
			break
		case '.net':
			cat = UrlCategory.geek
			break
		default:
			break
	}

	switch (hostname.slice(-3)) {
		case '.io':
			cat = UrlCategory.geek
			break
		case '.me':
			cat = UrlCategory.perso
			break
		default:
			break
	}

	// https://en.wikipedia.org/wiki/Second-level_domain
	switch (hostname.slice(-8, -3)) {
		case '.gouv.':
			cat = UrlCategory.pro
			break
		default:
			break
	}

	switch (hostname.slice(-7, -3)) {
		case '.com.':
		case '.edu.':
		case '.gov.':
		case '.law.':
			cat = UrlCategory.pro
			break
		default:
			break
	}

	switch (hostname.slice(-6, -3)) {
		case '.co.':
			cat = UrlCategory.pro
			break
		default:
			break
	}

	if (protocol !== 'https:' && protocol !== 'http:')
		cat = UrlCategory.special

	if (hostname === 'github.com')
		cat = UrlCategory.geek

	return cat
})

function select_color_for_url(parsed_url: URL): string {
	const { hostname, protocol } = parsed_url

	const cat = get_category_for_url(hostname, protocol)
	const hue = get_hue_for_category(cat)

	/*
	const index = get_variant_index_for_hostname(hostname)
	return get_colors()[hue][index]
	*/

	return RandomColor({
		luminosity: RandomColorLuminosity.light,
		hue,
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


const WIDTH2 = 'Iabcdefghjkmnopqstuvwxyz'
const WIDTH1 = ' ilr.'
function evaluate_string_width(s: string): number {
	// unit 1 ~= i or space
	let size = 0
	Array.from(s).forEach(c =>
		size += WIDTH1.includes(c)
			? 1
			: WIDTH2.includes(c)
				? 2
				: 3
	)

	return size
}

////////////////////////////////////

export {
	generate_label_from_url,
	select_color_for_url,
	evaluate_string_width,
}
