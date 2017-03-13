////////////////////////////////////
define(["require", "exports", "lodash", "randomcolor", "typescript-string-enums"], function (require, exports, _, RandomColor, typescript_string_enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ////////////////////////////////////
    //import { murmurhash3_32_gc } from '../tosort/murmur'
    const UrlCategory = typescript_string_enums_1.Enum('pro', // .com, .co.xyz, .biz
    'geek', // .net, .io
    'perso', // .me, .name
    'other', 'special');
    const RandomColorHue = typescript_string_enums_1.Enum('red', // too strong, too frightening, won't use
    'purple', // also too strong
    'orange', // maybe, but connoted to warning
    'yellow', // like a "work sign" -> tech, geek
    'blue', // "pro"
    'green', // good for misc non-pro
    'pink', // good for "snowflake" private sites
    'monochrome' // special
    );
    const RandomColorLuminosity = typescript_string_enums_1.Enum('bright', 'light', 'dark');
    ////////////////////////////////////
    /*
     const SEED: number = 3712
     const NUMBER_VARIANT_COUNT: number = 100
    
    const get_colors = _.memoize(function get_colors() {
        console.info('Generating colors...')
        const colors = {}
    
        Object.keys(RandomColorHue).forEach(hue => {
            colors[hue] = RandomColor({
                seed: SEED,
                count: NUMBER_VARIANT_COUNT,
                luminosity: RandomColorLuminosity.light,
                hue: hue as RandomColorHue
            })
        })
    
        return colors
    })
    */
    const get_hue_for_category = _.memoize(function get_hue_for_category(cat) {
        switch (cat) {
            case 'pro':
                return RandomColorHue.blue;
            case 'geek':
                return RandomColorHue.yellow;
            case 'other':
                // TODO spread
                return RandomColorHue.green;
            case 'perso':
                // TODO spread
                return RandomColorHue.pink;
            case 'special':
            /* fall through */
            default:
                return RandomColorHue.monochrome;
        }
    });
    /*
    const get_variant_index_for_hostname = _.memoize(function get_hued_variant_index_for_hostname(hostname: string): number {
        return (murmurhash3_32_gc(hostname, SEED) % NUMBER_VARIANT_COUNT)
    })
    */
    const get_category_for_url = _.memoize(function get_category1_for_url(hostname, protocol) {
        let cat = 'other';
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
    function select_color_for_url(parsed_url) {
        const { hostname, protocol } = parsed_url;
        const cat = get_category_for_url(hostname, protocol);
        const hue = get_hue_for_category(cat);
        /*
        const index = get_variant_index_for_hostname(hostname)
        return get_colors()[hue][index]
        */
        return RandomColor({
            luminosity: RandomColorLuminosity.light,
            hue,
        });
    }
    exports.select_color_for_url = select_color_for_url;
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