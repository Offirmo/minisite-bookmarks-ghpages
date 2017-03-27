
/////////////////////

interface Bookmark {
	readonly url: string // url given by the user, immutable
	readonly uniformized_url: string,

	// those parts are computed
	label: string
	weight: number // 1..3
	icon_base64?: string
	bgcolor: string
	secure: boolean
	parsed_url: URL
}

interface BookmarkGroup {
	title: string
	bookmarks: Bookmark[]
}
interface Data {
	vault_id: string
	raw_data: string // useful to flag successful raw data to be cached
	password: string // idem for password
	title: string, // page title
	rows: BookmarkGroup[]
}

/////////////////////

export {
	Bookmark,
	BookmarkGroup,
	Data,
}

/////////////////////
