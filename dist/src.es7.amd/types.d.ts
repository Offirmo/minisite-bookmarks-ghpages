interface Bookmark {
    label: string;
    url: string;
    weight: number;
    icon_base64?: string;
    secure: boolean;
    parsed_url: any;
}
interface BookmarkGroup {
    title: string;
    bookmarks: Bookmark[];
}
interface Data {
    raw_data: string;
    password: string;
    title: any;
    rows: BookmarkGroup[];
}
export { Bookmark, BookmarkGroup, Data };
