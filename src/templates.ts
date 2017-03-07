////////////////////////////////////

import { Bookmark, BookmarkGroup, Data } from './types'
import { evaluate_string_width } from './view-services'

////////////////////////////////////

function bookmark(bookmark: Bookmark, alternative: number): string {
	let {
		label,
		url,
		weight,
		bgcolor,
	} = bookmark

	label = label || url
	const lw = evaluate_string_width(label)

	let tachyons_classes = 'no-underline near-black ba dib'

	if (weight === 1 && lw <= 20)
		weight = 0
	else if (weight === 1 && lw <= 22) {
		weight = 0
		tachyons_classes += ` tracked-tight` // character spacing diminished
	}
	if (label.length > 50)
		tachyons_classes += ` tracked-tight` // character spacing diminished

	return `
<a class="grid-item grid-item--weight${alternative === -1 ? 0 : weight} ${tachyons_classes}"
	style="background-color: ${bgcolor};"
	href="${url}"
	title="${lw}">
	<div class="overlay"></div>
	<span class="label">${label}</span>
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
