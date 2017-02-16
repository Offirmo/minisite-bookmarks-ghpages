import { Enum } from "typescript-string-enums"

/////////////////////

interface Bookmark {
	url: string
	label?: string
	icon_base64?: string
}

interface Data {
	raw_data: string // useful to flag successful raw data to be cached
	password: string // idem for password
	top_bar: Bookmark[]
	rows: Bookmark[][]
}

/////////////////////

export {
	Bookmark,
	Data,
}

/////////////////////

/*
export const Status = Enum("RUNNING", "STOPPED")
export type Status = Enum<typeof Status>
*/
