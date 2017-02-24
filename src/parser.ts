////////////////////////////////////

import * as _ from 'lodash'

import { Bookmark, BookmarkGroup, Data } from './types'
import { generate_label_from_url, select_color_for_url } from './view-services'

//////////// CONSTANTS ////////////

const DEFAULT_PAGE_TITLE = 'Awesome bookmarks'
const DEFAULT_GROUP_TITLE = 'Unnamed group'

const BOOKMARK_LABEL_ERROR = '(parse error)'
const BOOKMARK_URL_ERROR = 'https://github.com/Offirmo/minisite-bookmarks'
const BOOKMARK_WEIGHT_DEFAULT = 1
const logger = console

////////////////////////////////////


// http://stackoverflow.com/a/1917041/587407
function sharedStart(array: string[]): string {
	let A = array.concat().sort(),
		a1 = A[0],
		a2 = A[A.length-1],
		L = a1.length,
		i = 0

	while(i < L && a1.charAt(i) === a2.charAt(i)) { i++ }

	return a1.substring(0, i)
}


function post_process_group(group: BookmarkGroup): BookmarkGroup {
	const auto_labelled_bookmarks = group.bookmarks.filter(bookmark => bookmark.label === bookmark.url)

	auto_labelled_bookmarks.forEach(bookmark => {
		bookmark.label = generate_label_from_url(bookmark.parsed_url)
	})

	const auto_labels = auto_labelled_bookmarks.map(bookmark => bookmark.label)

	const commonStartLength = sharedStart(auto_labels).length

	auto_labelled_bookmarks.forEach(bookmark => {
		let candidate_label = bookmark.label
		if (candidate_label.length <= commonStartLength) {
			candidate_label = candidate_label.slice(Math.max(0, _.lastIndexOf(Array.from(candidate_label), '/')))
		}
		else
			candidate_label = candidate_label.slice(commonStartLength)
		if (candidate_label.startsWith('/')) candidate_label = candidate_label.slice(1)
		bookmark.label = decodeURI(candidate_label)
	})

	return group
}

function parse_url(url): URL {
	let parsed_url
	try {
		parsed_url = new URL(url)
	}
	catch(e) {
		logger.error(`couldn’t parse url "${url}"`, e)
		parsed_url = {
			href: url
		} as URL
	}
	console.log({parsed_url})

	return parsed_url
}

function parse_bookmark(raw_line: string, line_count: number): Bookmark {
	let params = _.compact(raw_line.split(' '))

	let weight = BOOKMARK_WEIGHT_DEFAULT
	let url = BOOKMARK_URL_ERROR
	let label = BOOKMARK_LABEL_ERROR

	// bookmark title may have spaces, so we must be smarter
	if (params[0].startsWith('+'))
		weight = Math.max(1, Math.min(3, params.shift().length + 1))

	url = params.slice(-1)[0]
	console.log('extracted', {url})
	if(!url.includes('://'))
		url = 'http://' + url

	let parsed_url = parse_url(url)
	label = params.slice(0, -1).join(' ')
	console.log('extracted', {label})
	label = label || url

	return {
		label,
		url,
		weight,
		secure: parsed_url && parsed_url.protocol === 'https',
		bgcolor: select_color_for_url(parsed_url),
		parsed_url,
	}
}

function parse_data(raw_data: string): {title: string, rows: BookmarkGroup[]} {
	logger.groupCollapsed('parse_data')

	let title = DEFAULT_PAGE_TITLE
	const rows: BookmarkGroup[] = []

	const lines = raw_data.split('\n')
	let current_row: BookmarkGroup | null = null

	let line_count = 0
	lines.forEach(line => {
		line_count++

		if (!line) return
		line = _.trim(line)
		if (!line) return

		logger.groupCollapsed(`line #${line_count}`)

		logger.info(`parsing "${line}"`)

		if(line.startsWith('#')) {
			// title
			if (title !== 'Awesome bookmarks')
				logger.error(`line #${line_count} - found a conflicting title !`)
			else {
				title = _.trim(line.slice(1))
				logger.info(`line #${line_count} - found title: "${title}"`)
				if(current_row)
					logger.error(`line #${line_count} - title is misplaced, should be at the beginning !`)
			}
		}
		else if(line.startsWith('-')) {
			// new bookmark
			if (!current_row) {
				logger.error(`line #${line_count} - found a bookmark outside of a section !`)
				current_row = {
					title: DEFAULT_GROUP_TITLE,
					bookmarks: [],
				}
			}
			current_row.bookmarks.push(parse_bookmark(line.slice(1), line_count))
			logger.info(`line #${line_count} - parsed bookmark:`, current_row.bookmarks.slice(-1)[0])
		}
		else {
			// new group
			if (line.endsWith(':')) line = _.trim(line.slice(0, -1))
			logger.info(`line #${line_count} - found a new group: "${line}"`)
			if (current_row) {
				current_row = post_process_group(current_row)
				rows.push(current_row)
			}
			current_row = {
				title: line,
				bookmarks: [],
			}
		}

		logger.groupEnd()
	})

	const result = { title, rows}
	logger.info('final result:', result)

	logger.groupEnd()

	return result
}

function decrypt_if_needed_then_parse_data(raw_data: string, password: string = ''): Data {
	// pwd protection not supported yet

	const result: Data = {
		// rem: keeping a link to source data to allow caching if success
		raw_data,
		password,
		// parsing results:
		...parse_data(raw_data)
	}

	return  result
}


////////////////////////////////////

export {
	decrypt_if_needed_then_parse_data
}
