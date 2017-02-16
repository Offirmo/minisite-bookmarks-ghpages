interface Bookmark {
    url: string;
    label?: string;
    icon_base64?: string;
}
interface Data {
    raw_data: string;
    password: string;
    top_bar: Bookmark[];
    rows: Bookmark[][];
}
export { Bookmark, Data };
