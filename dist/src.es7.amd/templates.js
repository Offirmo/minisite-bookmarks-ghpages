////////////////////////////////////
define(["require", "exports"], function (require, exports) {
    "use strict";
    ////////////////////////////////////
    function bookmark(bookmark) {
        let { label, url, weight, } = bookmark;
        label = label || url;
        return `
<a class="grid-item grid-item--width${weight}" href="${url}" title="${label}">${label}</a>
`;
    }
    function bookmark_group(group) {
        const items = group.bookmarks.map(bookmark).join('');
        return `
<h2>${group.title}</h2>
<div class="grid">
	${items}
</div>
`;
    }
    function page(data) {
        const top_bar = bookmark_group(data.rows[0]);
        const items = data.rows.slice(1).map(bookmark_group).join('\n');
        return `
<h1>${data.title}</h1>
${top_bar}
${items}
`;
    }
    exports.page = page;
});
//# sourceMappingURL=templates.js.map