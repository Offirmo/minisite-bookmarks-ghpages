////////////////////////////////////

import * as _ from 'lodash'
import RandomColor = require('randomcolor')

////////////////////////////////////

const RANDOMCOLOR_CONSTS = {
	hues: [ 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'monochrome' ],
	luminosity: [ 'bright', 'light', 'dark' ]
}

function get_colors() {
	const colors = {}

	RANDOMCOLOR_CONSTS.hues.forEach(hue => {
		const by_lum = colors[hue] = {}

	})
	return colors
}


function select_color_for_url(parsed_url: URL): string {
	return RandomColor()
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
