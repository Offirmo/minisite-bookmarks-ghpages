////////////////////////////////////
define(["require", "exports", "randomcolor", "typescript-string-enums"], function (require, exports, RandomColor, typescript_string_enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ////////////////////////////////////
    const UrlCategory1 = typescript_string_enums_1.Enum('special', // not internet, ex. chrome settings, ftp...
    'pro', // .com, .co.xyz, .biz
    'geek', // .net, .io
    'perso', 'other');
    const RandomColorHue = typescript_string_enums_1.Enum('red', // note: too strong, do not use
    'orange', 'yellow', // ~ "work sign" -> tech, geek
    'green', 'blue', // "pro"
    'purple', 'pink', 'monochrome' // special
    );
    const RandomColorLuminosity = typescript_string_enums_1.Enum('bright', 'light', 'dark');
    ////////////////////////////////////
    function get_colors() {
        const colors = {};
        /*
        RANDOMCOLOR_CONSTS.hues.forEach(hue => {
            const by_lum = colors[hue] = {}
    
        })*/
        return colors;
    }
    function get_RandomColor_luminosity_for(parsed_url, cats) {
        return RandomColorLuminosity.light;
    }
    function get_RandomColor_hue_for(parsed_url, cats) {
        switch (cats.cat1) {
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
    }
    function select_color_for_url(parsed_url) {
        const { hostname, protocol } = parsed_url;
        let cat1 = 'other';
        switch (hostname.slice(-5)) {
            case '.name':
                cat1 = UrlCategory1.perso;
                break;
            default:
                break;
        }
        switch (hostname.slice(-4)) {
            case '.biz':
            case '.com':
            case '.pro':
            case '.edu':
                cat1 = UrlCategory1.pro;
                break;
            case '.net':
                cat1 = UrlCategory1.geek;
                break;
            default:
                break;
        }
        switch (hostname.slice(-3)) {
            case '.io':
                cat1 = UrlCategory1.geek;
                break;
            case '.me':
                cat1 = UrlCategory1.perso;
                break;
            default:
                break;
        }
        // other special cases
        if (hostname.slice(-6, -3) === '.co.')
            cat1 = UrlCategory1.pro;
        if (protocol !== 'https:' && protocol !== 'http:')
            cat1 = UrlCategory1.special;
        if (hostname === 'github.com')
            cat1 = UrlCategory1.geek;
        return RandomColor({
            luminosity: get_RandomColor_luminosity_for(parsed_url, { cat1 }),
            hue: get_RandomColor_hue_for(parsed_url, { cat1 }),
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
});
//# sourceMappingURL=view-services.js.map