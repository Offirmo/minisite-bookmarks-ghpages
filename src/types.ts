/////////////////////

interface Bookmark {
	url: string
	label?: string
	icon_base64?: string
}

interface Data {
	top_bar: Bookmark[]
	rows: Bookmark[][]
}

interface State {
	vault_id: string
	bookmarks: Data
}

/////////////////////

export {
	Bookmark,
	Data,
	State,

}

/////////////////////
