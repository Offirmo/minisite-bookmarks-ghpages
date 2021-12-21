////////////////////////////////////
define(["require", "exports", "tslib", "lodash", "typescript-string-enums", "chroma-js", "./templates", "./incubator/murmur_v3_32"], function (require, exports, tslib_1, _, typescript_string_enums_1, chroma_js_1, templates_1, murmur_v3_32_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.evaluate_string_width = exports.generate_background_color_for_url = exports.generate_label_from_url = void 0;
    _ = (0, tslib_1.__importStar)(_);
    chroma_js_1 = (0, tslib_1.__importDefault)(chroma_js_1);
    const marky = window.marky;
    ////////////////////////////////////
    const UrlCategory = (0, typescript_string_enums_1.Enum)('pro', // .com, .co.xyz, .com.xy, .biz
    'geek', // .net, .io
    'perso', // .me, .name
    'other', 'special');
    const UrlCategoryColorMapping = {
        [UrlCategory.pro]: '#45afff',
        [UrlCategory.geek]: '#f3ff4b',
        [UrlCategory.perso]: '#ffaada',
        [UrlCategory.other]: '#adf95e',
        [UrlCategory.special]: '#a1a1a1',
    };
    const SEED = 3712;
    const COLOR_VARIANT_COUNT = 33;
    // thank you @gka https://github.com/gka/chroma.js/issues/127#issuecomment-291457530
    const get_CMC_color_difference = chroma_js_1.default.deltaE;
    function get_CIE76_color_difference(ref_color, test_color) {
        const [L1, a1, b1] = (0, chroma_js_1.default)(ref_color).lab();
        const [L2, a2, b2] = (0, chroma_js_1.default)(test_color).lab();
        return Math.sqrt(Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2));
    }
    // https://en.wikipedia.org/wiki/Color_difference#CIE94
    function get_CIE94_color_difference(ref_color, test_color) {
        const [L1, a1, b1] = (0, chroma_js_1.default)(ref_color).lab();
        const [L2, a2, b2] = (0, chroma_js_1.default)(test_color).lab();
        // values for "graphic arts"
        const kL = 1;
        const K1 = 0.045;
        const K2 = 0.015;
        // usual values
        const kC = 1;
        const kH = 1;
        const deltaEab = Math.sqrt(Math.pow(L2 - L1, 2) + Math.pow(a2 - a1, 2) + Math.pow(b2 - b1, 2));
        const deltaL = L1 - L2;
        const C1 = Math.sqrt(a1 * a1 + b1 * b1);
        const C2 = Math.sqrt(a2 * a2 + b2 * b2);
        const deltaCab = C1 - C2;
        const deltaHab = Math.sqrt(deltaEab * deltaEab - deltaL * deltaL - deltaCab * deltaCab);
        // control
        const deltaa = a1 - a2;
        const deltab = b1 - b2;
        const deltaHab2 = Math.sqrt(deltaa * deltaa + deltab * deltab - deltaCab * deltaCab);
        console.assert(Math.trunc(deltaHab * 1000000) === Math.trunc(deltaHab2 * 1000000), 'erreur');
        const SL = 1;
        const SC = 1 + K1 * C1;
        const SH = 1 + K2 * C1;
        // parts
        const p1 = deltaL / kL * SL;
        const p2 = deltaCab / kC * SC;
        const p3 = deltaHab / kH * SH;
        return Math.sqrt(p1 * p1 + p2 * p2 + p3 * p3);
    }
    /*
    function color_difference(ref_color: string, test_color: string): number {
        return chroma.contrast(ref_color, test_color)
    }
    const MINIMAL_BG_DIFFERENCE = 1.5
    const MINIMAL_FG_DIFFERENCE = 7 // https://www.w3.org/TR/WCAG20-TECHS/G18.html
    */
    /*
    function color_difference(ref_color: string, test_color: string): number {
        return Math.min(
            get_CMC_color_difference(ref_color, test_color),
            get_CMC_color_difference(test_color, ref_color)
        )
    }
    const MINIMAL_BG_DIFFERENCE = 30
    const MINIMAL_FG_DIFFERENCE = 70
    */
    /*
    function color_difference(ref_color: string, test_color: string): number {
        return get_CIE76_color_difference(ref_color, test_color)
    }
    const JND = 2.3
    const MINIMAL_BG_DIFFERENCE = JND * 7
    const MINIMAL_FG_DIFFERENCE = JND * 14
    */
    function color_difference(ref_color, test_color) {
        return Math.min(get_CIE94_color_difference(ref_color, test_color), get_CIE94_color_difference(test_color, ref_color));
    }
    const JND = 2.3;
    const MINIMAL_BG_DIFFERENCE = JND * 7;
    const MINIMAL_FG_DIFFERENCE = JND * 10;
    marky.mark('generate-color-range');
    const CACHED_COLOR_RANGE_BOUNDS = {
        [UrlCategory.pro]: ["#cae7fd", "#45afff"],
        [UrlCategory.geek]: ["#f9fcde", "#f3ff4b"],
        [UrlCategory.perso]: ["#fcdef0", "#ffaada"],
        [UrlCategory.other]: ["#ecfbdf", "#adf95e"],
        [UrlCategory.special]: ["#cccdcd", "#a1a1a1"],
    };
    const UrlCategoryColorRange = {
        [UrlCategory.pro]: get_color_range_for(UrlCategory.pro),
        [UrlCategory.geek]: get_color_range_for(UrlCategory.geek),
        [UrlCategory.perso]: get_color_range_for(UrlCategory.perso),
        [UrlCategory.other]: get_color_range_for(UrlCategory.other),
        [UrlCategory.special]: get_color_range_for(UrlCategory.special),
    };
    marky.stop('generate-color-range');
    const hash_int32 = _.memoize(_.curryRight(murmur_v3_32_1.murmurhash_v3_32_gc)(SEED));
    function generate_color_range_bounds_for(category) {
        console.groupCollapsed(`generate_color_range_bounds_for ${category}`);
        let color_range_lower_bound;
        let color_range_upper_bound;
        const INTERMEDIATE_SCALE_LENGTH = 100;
        const base_color = UrlCategoryColorMapping[category];
        let intermediate_scale;
        if ((0, chroma_js_1.default)(templates_1.BACKGROUND_COLOR).luminance() > (0, chroma_js_1.default)(base_color).luminance()) {
            intermediate_scale = chroma_js_1.default.scale([
                templates_1.BACKGROUND_COLOR,
                base_color
            ]).colors(INTERMEDIATE_SCALE_LENGTH);
        }
        else {
            throw new Error('Dark background is NOT implemented, sorry !');
        }
        console.log({ intermediate_scale });
        // look for lightest acceptable variant with enough color difference
        let intermediate_scale_lowest_acceptable_index = -1;
        for (let i = 0; i < intermediate_scale.length && intermediate_scale_lowest_acceptable_index === -1; ++i) {
            const candidate_color = intermediate_scale[i];
            console.log({
                i,
                candidate_color,
                difference_with_bg1: color_difference(templates_1.BACKGROUND_COLOR, candidate_color),
                difference_with_bg2: color_difference(candidate_color, templates_1.BACKGROUND_COLOR),
            });
            if (color_difference(templates_1.BACKGROUND_COLOR, candidate_color) >= MINIMAL_BG_DIFFERENCE) {
                intermediate_scale_lowest_acceptable_index = i;
                break;
            }
        }
        if (intermediate_scale_lowest_acceptable_index === -1) {
            // this should never happen, but...
            console.error(`Failed to compute lower scale bound for ${category}/${base_color} !`);
            intermediate_scale_lowest_acceptable_index = 10;
        }
        color_range_lower_bound = intermediate_scale[intermediate_scale_lowest_acceptable_index];
        // look for darkest acceptable variant with enough color difference
        let intermediate_scale_highest_acceptable_index = -1;
        for (let i = INTERMEDIATE_SCALE_LENGTH - 1; i > intermediate_scale_lowest_acceptable_index && intermediate_scale_highest_acceptable_index === -1; --i) {
            const candidate_color = intermediate_scale[i];
            console.log({
                i,
                candidate_color,
                difference_with_fg1: color_difference(templates_1.FOREGROUND_COLOR, candidate_color),
                difference_with_fg2: color_difference(candidate_color, templates_1.FOREGROUND_COLOR),
            });
            if (color_difference(candidate_color, templates_1.FOREGROUND_COLOR) >= MINIMAL_FG_DIFFERENCE) {
                intermediate_scale_highest_acceptable_index = i;
            }
        }
        if (intermediate_scale_highest_acceptable_index === -1) {
            // it can happen that the base color is already at high contrast
            console.warn(`Failed to compute upper scale bound for ${category}/${base_color} !`);
            intermediate_scale_highest_acceptable_index = INTERMEDIATE_SCALE_LENGTH - 30;
        }
        color_range_upper_bound = intermediate_scale[intermediate_scale_highest_acceptable_index];
        console.groupEnd();
        console.log([color_range_lower_bound, color_range_upper_bound]);
        return [
            color_range_lower_bound,
            color_range_upper_bound
        ];
    }
    function get_color_range_for(category) {
        const [color_range_lower_bound, color_range_upper_bound] = CACHED_COLOR_RANGE_BOUNDS[category] || generate_color_range_bounds_for(category);
        return chroma_js_1.default.scale([
            color_range_lower_bound,
            color_range_upper_bound
        ])
            .colors(COLOR_VARIANT_COUNT);
    }
    ////////////////////////////////////
    const get_category_for_url = _.memoize(function get_category1_for_url(hostname, protocol) {
        let cat = 'other';
        switch (hostname.slice(-14)) {
            case '.atlassian.net':
                return UrlCategory.pro;
            default:
                break;
        }
        switch (hostname.slice(-5)) {
            case '.name':
            case '.blog':
                cat = UrlCategory.perso;
                break;
            default:
                break;
        }
        switch (hostname.slice(-4)) {
            case '.biz':
            case '.com':
            case '.pro':
            case '.gov':
            case '.edu':
            case '.mil':
                cat = UrlCategory.pro;
                break;
            case '.net':
                cat = UrlCategory.geek;
                break;
            default:
                break;
        }
        switch (hostname.slice(-3)) {
            case '.io':
                cat = UrlCategory.geek;
                break;
            case '.me':
                cat = UrlCategory.perso;
                break;
            default:
                break;
        }
        // https://en.wikipedia.org/wiki/Second-level_domain
        switch (hostname.slice(-8, -3)) {
            case '.gouv.':
                cat = UrlCategory.pro;
                break;
            default:
                break;
        }
        switch (hostname.slice(-7, -3)) {
            case '.com.':
            case '.edu.':
            case '.gov.':
            case '.law.':
                cat = UrlCategory.pro;
                break;
            default:
                break;
        }
        switch (hostname.slice(-6, -3)) {
            case '.co.':
                cat = UrlCategory.pro;
                break;
            default:
                break;
        }
        if (protocol !== 'https:' && protocol !== 'http:')
            cat = UrlCategory.special;
        if (hostname === 'github.com')
            cat = UrlCategory.geek;
        return cat;
    });
    function generate_background_color_for_url(parsed_url, uniformized_url) {
        const { hostname, protocol } = parsed_url;
        const cat = get_category_for_url(hostname, protocol);
        return UrlCategoryColorRange[cat][hash_int32(uniformized_url) % COLOR_VARIANT_COUNT];
    }
    exports.generate_background_color_for_url = generate_background_color_for_url;
    function generate_label_from_url(parsed_url) {
        let candidate_label = parsed_url.href;
        // remove low-interest infos / "noise" to make the label smaller
        if (parsed_url.protocol !== 'https:' && parsed_url.protocol !== 'http:') {
            // don't touch anything
        }
        else {
            // remove the protocol
            candidate_label = parsed_url.host + parsed_url.pathname;
        }
        if (candidate_label.endsWith('/'))
            candidate_label = candidate_label.slice(0, -1);
        if (candidate_label.startsWith('www.'))
            candidate_label = candidate_label.slice(4);
        return candidate_label;
    }
    exports.generate_label_from_url = generate_label_from_url;
    // experiment for dynamic font size adjustment
    const WIDTH2 = 'Iabcdefghjkmnopqstuvwxyz';
    const WIDTH1 = ' ilr.';
    function evaluate_string_width(s) {
        // unit 1 ~= i or space
        let size = 0;
        Array.from(s).forEach(c => size += WIDTH1.includes(c)
            ? 1
            : WIDTH2.includes(c)
                ? 2
                : 3);
        return size;
    }
    exports.evaluate_string_width = evaluate_string_width;
});
//# sourceMappingURL=view-services.js.map