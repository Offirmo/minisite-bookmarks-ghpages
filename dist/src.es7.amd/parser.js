////////////////////////////////////
define(["require", "exports", "lodash", "./view-services"], function (require, exports, _, view_services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const marky = window.marky;
    //////////// CONSTANTS ////////////
    const DEFAULT_PAGE_TITLE = 'Awesome bookmarks';
    const DEFAULT_GROUP_TITLE = 'Unnamed group';
    const BOOKMARK_URL_ERROR = 'https://github.com/Offirmo/minisite-bookmarks';
    const BOOKMARK_WEIGHT_DEFAULT = 1;
    const DEFAULT_OPTIONS = {
        logger: console,
    };
    function is_url_separator(c) {
        return c === '/' || c === '.' || c === ':';
    }
    function factory(raw_options) {
        const options = Object.assign({}, DEFAULT_OPTIONS, raw_options);
        const { logger } = options;
        // http://stackoverflow.com/a/1917041/587407
        function sharedStart(array) {
            if (array.length <= 1)
                return '';
            const A = array.concat().sort();
            const a1 = A[0];
            const a2 = A[A.length - 1];
            const L = a1.length;
            let i = 0;
            while (i < L && a1.charAt(i) === a2.charAt(i)) {
                i++;
            }
            return a1.substring(0, i);
        }
        function post_process_group(group) {
            logger.groupCollapsed('post_process_group');
            const auto_labelled_bookmarks = group.bookmarks.filter(bookmark => bookmark.label === bookmark.url);
            auto_labelled_bookmarks.forEach(bookmark => {
                bookmark.label = view_services_1.generate_label_from_url(bookmark.parsed_url);
            });
            const auto_labels = auto_labelled_bookmarks.map(bookmark => bookmark.label);
            if (auto_labels.length) {
                const common_prefix_length = sharedStart(auto_labels).length;
                const common_prefix = auto_labels[0].slice(0, common_prefix_length);
                logger.log(`computed shared part:`, { common_prefix_length, common_prefix });
                // the shared prefix removal is sometimes too greedy,
                // example: deezer.com devodcs.io => "de" is removed :-/
                // let's do this only if it ends with or is followed with an expected separator
                const common_prefix_ends_on_separator = is_url_separator(common_prefix.slice(-1));
                auto_labelled_bookmarks.forEach(bookmark => {
                    const initial_label = bookmark.label;
                    let candidate_label = bookmark.label;
                    if (candidate_label.length <= common_prefix_length) {
                        // let's keep something !
                        candidate_label = candidate_label.slice(Math.max(0, _.lastIndexOf(Array.from(candidate_label), '/')));
                    }
                    else {
                        if (!common_prefix_ends_on_separator && !is_url_separator(candidate_label[common_prefix_length])) {
                            // better not remove the prefix
                        }
                        else
                            candidate_label = candidate_label.slice(common_prefix_length);
                    }
                    if (is_url_separator(candidate_label[0]))
                        candidate_label = candidate_label.slice(1);
                    bookmark.label = decodeURI(candidate_label);
                    logger.log(`changed label "${initial_label}" to "${bookmark.label}"`);
                });
            }
            logger.groupEnd();
            return group;
        }
        function parse_url(url) {
            let parsed_url;
            try {
                parsed_url = new URL(url);
            }
            catch (e) {
                logger.warn(`couldn’t parse url "${url}"`, e);
                parsed_url = {
                    // the bare minimum we need for the remaining of the processing
                    href: url,
                    hostname: '',
                };
            }
            logger.log({ parsed_url });
            return parsed_url;
        }
        function parse_bookmark(raw_line) {
            const params = _.compact(raw_line.split(' '));
            let weight = BOOKMARK_WEIGHT_DEFAULT;
            if ((params[0] || '').startsWith('+')) {
                const raw_weight = params.shift().length + 1;
                logger.log('raw weight extracted:', raw_weight);
                weight = Math.max(1, Math.min(3, raw_weight));
            }
            let url = params.slice(-1)[0] || BOOKMARK_URL_ERROR;
            logger.log('raw url extracted:', url);
            if (!url.includes('://'))
                url = 'http://' + url;
            const parsed_url = parse_url(url);
            // bookmark title may have spaces, so we must be smarter
            let label = params.slice(0, -1).join(' ');
            logger.log('raw label extracted:', label);
            // it's ok to not have a label
            label = label || url;
            const uniformized_url = url; // TODO
            const res = {
                url,
                uniformized_url,
                label,
                weight,
                secure: parsed_url && parsed_url.protocol === 'https',
                bgcolor: view_services_1.generate_background_color_for_url(parsed_url, uniformized_url),
                parsed_url,
            };
            logger.log('Final, corrected, data extracted from line (before group-level post-processing):', 
            // clamp down data to ease debugging
            Object.assign({}, res));
            return res;
        }
        function parse_data(raw_data) {
            logger.groupCollapsed('parse_data');
            let title = DEFAULT_PAGE_TITLE;
            const rows = [];
            const lines = raw_data.split('\n');
            let current_group = null;
            let line_count = 0;
            lines.forEach(line => {
                line_count++;
                if (!line)
                    return;
                line = _.trim(line);
                if (!line)
                    return;
                if (line.startsWith('[comment]: <>')) {
                    // http://stackoverflow.com/questions/4823468/comments-in-markdown
                    logger.info(`line #${line_count} is a comment`);
                    return;
                }
                const group_debug_info = current_group
                    ? `parsing group #${rows.length + 1} "${current_group.title}" with ${current_group.bookmarks.length} parsed bookmarks so far`
                    : `no group found yet`;
                logger.groupCollapsed(`line #${line_count} - (${group_debug_info})`);
                logger.info(`parsing "${line}"`);
                if (line.startsWith('#')) {
                    // title
                    const candidate_title = _.trim(line.slice(1));
                    logger.info(`line #${line_count} - found title: "${candidate_title}"`);
                    // title
                    if (title !== DEFAULT_PAGE_TITLE)
                        logger.error(`line #${line_count} - title "#${candidate_title}" is conflicting with a previous one "#${title}" !`);
                    else {
                        if (current_group)
                            logger.error(`line #${line_count} - title is misplaced, should be at the beginning !`);
                        title = candidate_title;
                    }
                }
                else if (line.startsWith('-') || line.startsWith('*')) {
                    // new bookmark
                    logger.log(`line #${line_count} - found a bookmark...`);
                    if (!current_group) {
                        logger.error(`line #${line_count} - found a bookmark outside of a section !`);
                        current_group = {
                            title: DEFAULT_GROUP_TITLE,
                            bookmarks: [],
                        };
                    }
                    current_group.bookmarks.push(parse_bookmark(line.slice(1)));
                    logger.info(`line #${line_count} - parsed bookmark:`, current_group.bookmarks.slice(-1)[0]);
                }
                else {
                    // new group
                    if (line.endsWith(':'))
                        line = _.trim(line.slice(0, -1));
                    logger.info(`line #${line_count} - found a new group: "${line}"`);
                    if (current_group) {
                        logger.info(`Closing previous group: "${current_group.title}"`, current_group);
                        current_group = post_process_group(current_group);
                        rows.push(current_group);
                    }
                    current_group = {
                        title: line,
                        bookmarks: [],
                    };
                }
                logger.groupEnd();
            });
            // close the last group
            if (!current_group) {
                logger.error('No group at all ? Please add some data !');
            }
            else {
                logger.info(`Closing last group: "${current_group.title}"`, current_group);
                current_group = post_process_group(current_group);
                rows.push(current_group);
                current_group = null;
            }
            const result = { title, rows };
            logger.info('final result:', result);
            logger.groupEnd();
            return result;
        }
        function decrypt_if_needed_then_parse_data(vault_id, raw_data, password = '') {
            logger.info('decrypt_if_needed_then_parse_data', { vault_id, raw_data, password });
            // pwd protection not supported yet
            marky.mark('decrypt-and-parse');
            const result = Object.assign({ 
                // rem: keeping a link to source data to allow caching if success
                vault_id,
                raw_data,
                password }, parse_data(raw_data));
            marky.stop('decrypt-and-parse');
            return result;
        }
        return {
            decrypt_if_needed_then_parse_data
        };
    }
    exports.factory = factory;
});
//# sourceMappingURL=parser.js.map