////////////////////////////////////
define(["require", "exports"], function (require, exports) {
    "use strict";
    ////////////////////////////////////
    const ALT0_TACHYONS_BG_COLOR = 'light-gray';
    const ALT1_TACHYONS_BG_COLOR = 'light-gray';
    function bookmark(bookmark, alt) {
        let { label, url, weight, bgcolor, } = bookmark;
        label = label || url;
        let tachyons_classes = 'no-underline near-black ba bw1 dib';
        tachyons_classes += alt === 0 ? ` b--${ALT0_TACHYONS_BG_COLOR}` : ` b--${ALT1_TACHYONS_BG_COLOR}`;
        return `
<a class="grid-item grid-item--weight${weight} ${tachyons_classes}" style="background-color: ${bgcolor};" href="${url}" title="${label}">
	<span class="label">${label}</span>
</a>
`;
    }
    function bookmark_group(group, index) {
        const alt = index % 2;
        const items = group.bookmarks.map(b => bookmark(b, alt)).join('');
        let tachyons_classes = 'pa1';
        tachyons_classes += alt === 0 ? ` bg-${ALT0_TACHYONS_BG_COLOR}` : ` bg-${ALT1_TACHYONS_BG_COLOR}`;
        return `
<div class="${tachyons_classes}">
	<h2 class="pa0 ma0">${group.title}</h2>
	<div class="grid">
		${items}
	</div>
</div>
`;
    }
    function page(data) {
        const top_bar = bookmark_group(data.rows[0], 1);
        const items = data.rows.slice(1).map(bookmark_group).join('\n');
        return `
<h1 class="pa1 ma0 dn">${data.title}</h1>
${top_bar}
${items}
`;
    }
    exports.page = page;
});
//# sourceMappingURL=templates.js.map