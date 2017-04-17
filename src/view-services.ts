////////////////////////////////////

import * as _ from 'lodash'
import { Enum } from 'typescript-string-enums'
import * as chroma from 'chroma-js'
const marky = (window as any).marky

import {
	BACKGROUND_COLOR,
	FOREGROUND_COLOR,
} from './templates'
import { murmurhash_v3_32_gc as hash_int32_uncached } from './incubator/murmur_v3_32'

////////////////////////////////////


const UrlCategory = Enum(
	'pro', // .com, .co.xyz, .biz
	'geek', // .net, .io
	'perso', // .me, .name
	'other',
	'special', // not internet, ex. chrome settings, ftp...
)
type UrlCategory = Enum<typeof UrlCategory>

const UrlCategoryColorMapping = {
	[ UrlCategory.pro ]: '#2fb1ff', // blue-ish
	[ UrlCategory.geek ]: '#f5ff5b', // yellow-ish
	[ UrlCategory.perso ]: '#ffb5e1', // pink-ish
	[ UrlCategory.other ]: '#bdff77', // green-ish
	[ UrlCategory.special ]: 'black',
}

const SEED: number = 3712
const COLOR_VARIANT_COUNT: number = 50

marky.mark('generate-color-range')
const UrlCategoryColorRange = {
	[ UrlCategory.pro ]: generate_color_range_for(UrlCategory.pro),
	[ UrlCategory.geek ]: generate_color_range_for(UrlCategory.geek),
	[ UrlCategory.perso ]: generate_color_range_for(UrlCategory.perso),
	[ UrlCategory.other ]: generate_color_range_for(UrlCategory.other),
	[ UrlCategory.special ]: generate_color_range_for(UrlCategory.special),
}
marky.stop('generate-color-range')

const hash_int32: (s: string) => number = _.memoize(_.curryRight(hash_int32_uncached)(SEED))

function generate_color_range_for(category: UrlCategory): string[] {
	const INTERMEDIATE_SCALE_LENGTH = 100
	const MINIMAL_FG_CONTRAST = 7 // https://www.w3.org/TR/WCAG20-TECHS/G18.html
	const MINIMAL_BG_CONTRAST = 1.5

	const base_color = UrlCategoryColorMapping[category]

	let intermediate_scale: string[]
	if (chroma(BACKGROUND_COLOR).luminance() > chroma(base_color).luminance()) {
		intermediate_scale = chroma.scale([
			BACKGROUND_COLOR,
			base_color
		]).colors(INTERMEDIATE_SCALE_LENGTH)
	}
	else {
		throw new Error('Dark background is NOT implemented, sorry !')
	}

	console.log({intermediate_scale})

	let scale_lower_bound: string = 'xxx'
	let scale_upper_bound: string = 'xxx'
	intermediate_scale.find(color => {
		/*console.log({
			color,
			contrast_to_bg: chroma.contrast(BACKGROUND_COLOR, color),
			contrast_to_fg: chroma.contrast(FOREGROUND_COLOR, color),
			scale_lower_bound,
			scale_upper_bound,
		})*/

		if (scale_lower_bound === 'xxx' && chroma.contrast(BACKGROUND_COLOR, color) >= MINIMAL_BG_CONTRAST)
			scale_lower_bound = color

		if (scale_upper_bound === 'xxx' && chroma.contrast(FOREGROUND_COLOR, color) <= MINIMAL_FG_CONTRAST)
			scale_upper_bound = color

		return (scale_lower_bound !== 'xxx' && scale_upper_bound !== 'xxx')
	})
	if (scale_upper_bound === 'xxx') {
		// it can happen that the base color is already at high contrast
		console.warn(`Failed to compute upper scale bound for ${category}/${base_color} !`)
		scale_upper_bound = intermediate_scale[INTERMEDIATE_SCALE_LENGTH - 30]
	}
	if (scale_lower_bound === 'xxx') {
		// this should never happen, but...
		console.error(`Failed to compute lower scale bound for ${category}/${base_color} !`)
		scale_lower_bound = intermediate_scale[10]
	}

	return chroma.scale([
		scale_lower_bound,
		scale_upper_bound
	])
	.colors(COLOR_VARIANT_COUNT)
}

////////////////////////////////////

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

function generate_background_color_for_url(parsed_url: URL, uniformized_url: string): string {
	const { hostname, protocol } = parsed_url

	const cat = get_category_for_url(hostname, protocol)

	return UrlCategoryColorRange[cat][hash_int32(uniformized_url) % COLOR_VARIANT_COUNT]
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
	generate_background_color_for_url,
	evaluate_string_width,
}
