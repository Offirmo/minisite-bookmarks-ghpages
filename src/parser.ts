////////////////////////////////////

import * as _ from 'lodash'

import { Bookmark, BookmarkGroup, Data } from './types'

//////////// CONSTANTS ////////////

const DEFAULT_PAGE_TITLE = 'Awesome bookmarks'
const DEFAULT_GROUP_TITLE = 'Unnamed group'

const BOOKMARK_LABEL_ERROR = '(parse error)'
const BOOKMARK_URL_ERROR = 'https://github.com/Offirmo/minisite-bookmarks'
const BOOKMARK_WEIGHT_DEFAULT = 1
const logger = console

////////////////////////////////////

function parse_bookmark(raw_line: string, line_count: number): Bookmark {
	let params = _.compact(raw_line.split(' '))

	let weight = BOOKMARK_WEIGHT_DEFAULT
	let url = BOOKMARK_URL_ERROR
	let label = BOOKMARK_LABEL_ERROR

	// bookmark title may have spaces, so we must be smarter
	if (params[0].startsWith('+'))
		weight = params.shift().length

	label = params.slice(0, -1).join(' ')
	url = params.slice(-1)[0]

	return {
		label,
		url,
		weight,
	}

	/*
	switch(params.length) {
		case 3: {
			const [weight, label, url] = params
			return {
				label,
				url,
				weight: Number(weight)
			}
		}

		case 2: {
			const [label, url] = params
			return {
				label,
				url,
				weight: BOOKMARK_WEIGHT_DEFAULT,
			}
		}

		case 1: {
			const [url] = params
			return {
				label: url,
				url,
				weight: BOOKMARK_WEIGHT_DEFAULT,
			}
		}

		default:
			logger.error(`line #${line_count} - wrong bookmark, unexpected number of elements on the line !`)
			return {
				label: BOOKMARK_LABEL_ERROR,
				url: BOOKMARK_URL_ERROR,
				weight: BOOKMARK_WEIGHT_DEFAULT,
			}
	}
	*/
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
			if (line.endsWith(':')) line = _.trim(line.slice(0, -1))
			logger.info(`line #${line_count} - found a new group: "${line}"`)
			// new group
			if (current_row) {
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
