interface Bookmark {
    readonly url: string;
    readonly uniformized_url: string;
    parsed_url: URL;
    label: string;
    weight: number;
    icon_base64?: string;
    bgcolor: string;
    secure: boolean;
}
interface BookmarkGroup {
    title: string;
    bookmarks: Bookmark[];
}
interface Data {
    vault_id: string;
    raw_data: string;
    password: string;
    title: string;
    rows: BookmarkGroup[];
}
export { Bookmark, BookmarkGroup, Data };
