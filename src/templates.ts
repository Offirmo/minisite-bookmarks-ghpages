////////////////////////////////////

import { Bookmark, BookmarkGroup, Data } from './types'

////////////////////////////////////

function bookmark(bookmark: Bookmark, alternative: number): string {
	let {
		label,
		url,
		weight,
		bgcolor,
	} = bookmark

	label = label || url

	let tachyons_classes = 'no-underline near-black ba bw1 dib'

	if (label.length > 20)
		tachyons_classes += ` tracked-tight` // character spacing diminished

	return `
<a class="grid-item grid-item--weight${alternative === -1 ? 0 : weight} ${tachyons_classes}"
	style="background-color: ${bgcolor};"
	href="${url}"
	title="${label}">
	<div class="overlay"></div>
	<span class="label">${label}</span>
</a>
`
}

function bookmark_group(group: BookmarkGroup, index: number): string {
	const is_pinned_row = group.title.toLowerCase() === 'pinned'
	const alternative = is_pinned_row ? -1 : index % 2
	const items = group.bookmarks.map(b => bookmark(b, alternative)).join('')
	const title = is_pinned_row ? '' : `<h2 class="pa0 ma0">${group.title}</h2>`
	let tachyons_classes = 'pa1'

	return `
<div class="${tachyons_classes}">
	${title}
	<div class="grid">
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
