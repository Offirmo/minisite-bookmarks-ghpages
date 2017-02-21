////////////////////////////////////

import { Bookmark, BookmarkGroup, Data } from './types'

////////////////////////////////////

function bookmark(bookmark: Bookmark): string {
	let {
		label,
		url,
		weight,
	} = bookmark

	label = label || url

	return `
<a class="grid-item grid-item--width${weight}" href="${url}" title="${label}">${label}</a>
`
}

function bookmark_group(group: BookmarkGroup): string {

	const items = group.bookmarks.map(bookmark).join('')

	return `
<h2>${group.title}</h2>
<div class="grid">
	${items}
</div>
`
}

function page(data: Data): string {

	const top_bar = bookmark_group(data.rows[0])
	const items = data.rows.slice(1).map(bookmark_group).join('\n')

	return `
<h1>${data.title}</h1>
${top_bar}
${items}
`
}

////////////////////////////////////

export {
	page
}
