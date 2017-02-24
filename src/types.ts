import { Enum } from "typescript-string-enums"

/////////////////////

interface Bookmark {
	label: string
	url: string
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
	raw_data: string // useful to flag successful raw data to be cached
	password: string // idem for password
	title, // page title
	rows: BookmarkGroup[]
}

/////////////////////

export {
	Bookmark,
	BookmarkGroup,
	Data,
}

/////////////////////

/*
export const Status = Enum("RUNNING", "STOPPED")
export type Status = Enum<typeof Status>
*/
