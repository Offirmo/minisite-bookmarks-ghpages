////////////////////////////////////

import { Bookmark, BookmarkGroup, Data } from './types'
//import { evaluate_string_width } from './view-services'

////////////////////////////////////

function bookmark(bookmark: Bookmark, alternative: number): string {
	let {
		label,
		url,
		weight,
		bgcolor,
		parsed_url,
	} = bookmark

	label = label || url

	// tc
	let tachyons_classes = 'no-underline near-black ba dib'

	/* Experiment with smaller tiles
	const lw = evaluate_string_width(label)
	if (weight === 1 && lw <= 20)
		weight = 0
	else if (weight === 1 && lw <= 23) {
		weight = 0
		tachyons_classes += ` tracked-tight` // character spacing diminished
	}
	*/
	if (label.length > 50)
		tachyons_classes += ` tracked-tight` // character spacing diminished

	let favicon = `<span class="icon"><img height="16" width="16" src='content/bookmark.png' /></span>`
	if (parsed_url.protocol === 'https:' || parsed_url.protocol === 'http:') {
		// http://stackoverflow.com/questions/5119041/how-can-i-get-a-web-sites-favicon
		favicon = `<span class="icon"><img height="16" width="16" src='http://www.google.com/s2/favicons?domain=${parsed_url.hostname}' /></span>`
		//favicon = `<span class="icon"><img height="20" width="20" src='http://f1.allesedv.com/24/${parsed_url.hostname}' /></span>`
		//favicon = `<span class="icon"><img height="16" width="16" src='http://favicon.yandex.net/favicon/${parsed_url.hostname}' /></span>`
	}

	return `
<a class="grid-item grid-item--weight${alternative === -1 ? 0 : weight} ${tachyons_classes}"
	style="background-color: ${bgcolor};"
	href="${url}"
	title="${label}">
	<div class="overlay"></div>
	<div class="container">
		${favicon}
		<span class="label">${label}</span>
	</div>
</a>
`
}

function bookmark_group(group: BookmarkGroup, index: number): string {
	const is_pinned_row = group.title.toLowerCase() === 'pinned'
	const alternative = is_pinned_row
		? -1
		: index % 2
	const items = group.bookmarks.map(b => bookmark(b, alternative)).join('')
	const title_html = is_pinned_row
		? ''
		: `<div class="pa0 ma0 stamp dib">${group.title}</div>`
	let tachyons_classes = 'pa0'

	return `
<div class="${tachyons_classes}">
	<div class="grid ${is_pinned_row?'pinned':''}">
		${title_html}
		${items}
	</div>
</div>
`
}

function page(data: Data): string {

	const items = data.rows.map(bookmark_group).join('\n')

	return `
<h1 class="pa1 ma0 dn">${data.title}</h1>
${items}
`
}

////////////////////////////////////

export {
	page
}
