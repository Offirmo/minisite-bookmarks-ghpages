////////////////////////////////////
define(["require", "exports", "@reactivex/rxjs", "@offirmo/rx-auto", "when-dom-ready", "./incubator/retrying-fetch", "./incubator/rx-log", "./parser", "./templates", "packery", "tachyons"], function (require, exports, Rx, rx_auto_1, whenDomReady, retrying_fetch_1, rx_log_1, parser_1, TEMPLATES, Packery) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //////////// CONSTANTS ////////////
    const logger = console;
    const CONSTS = {
        LS_KEYS: {
            last_successful_raw_config: 'minisite-bookmark.last_successful_raw_config',
            last_successful_raw_data: (vault_id) => `minisite-bookmark.${vault_id}.last_successful_raw_data`,
            last_successful_password: (vault_id) => `minisite-bookmark.${vault_id}.last_successful_password`,
        },
        REPO_URL: 'https://github.com/Offirmo/minisite-w',
    };
    ////////////////////////////////////
    function get_vault_id() {
        let slug = window.location.hash.slice(1)
            || location.pathname.split('/').filter(x => x).slice(-1)[0]
            || 'default';
        // GitHub demo
        if (slug === 'minisite-bookmarks-ghpages')
            slug = 'default';
        // dev local
        if (slug === '404.html')
            slug = 'default';
        return slug;
    }
    function fetch_raw_data(vault_id) {
        return retrying_fetch_1.retrying_fetch(`content/${vault_id}.markdown`, undefined, { response_should_be_ok: true })
            .then(res => res.text());
    }
    function get_cached_raw_data(vault_id) {
        const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data(vault_id));
        return cached_data ?
            cached_data :
            Rx.Observable.empty();
    }
    function get_password$() {
        /*
        const input = document.querySelector('password-input');
        return Rx.Observable
            .fromEvent(input, 'click')
            .debounceTime(250)
            */
        return Rx.Observable.create((observer) => {
            observer.next(''); // no password
            // never
        });
    }
    function get_cached_password(vault_id) {
        const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_password(vault_id));
        return cached_data ?
            cached_data :
            Rx.Observable.empty();
    }
    ////////////////////////////////////
    console.log('App: Hello world !', { constants: CONSTS });
    const subjects = rx_auto_1.auto({
        vault_id: get_vault_id,
        cached_raw_data: [
            'vault_id',
            (deps) => get_cached_raw_data(deps['vault_id'].value)
        ],
        fresh_raw_data: [
            'vault_id',
            (deps) => fetch_raw_data(deps['vault_id'].value)
        ],
        raw_data: [
            'cached_raw_data',
            'fresh_raw_data',
            rx_auto_1.OPERATORS.concat
        ],
        cached_password: [
            'vault_id',
            (deps) => get_cached_password(deps['vault_id'].value)
        ],
        fresh_password: get_password$,
        password: [
            'cached_password',
            'fresh_password',
            rx_auto_1.OPERATORS.concat
        ],
        data: [
            'raw_data',
            'password',
            ({ raw_data, password }) => Rx.Observable.combineLatest(raw_data.observable$, password.observable$, parser_1.decrypt_if_needed_then_parse_data)
        ],
        is_dom_ready: whenDomReady(),
    }, { logger: console });
    for (let id in subjects) {
        //console.log(`subject ${id}`)
        rx_log_1.log_observable(subjects[id].plain$, id);
    }
    ////////////////////////////////////
    // actions
    let sbs1 = subjects['fresh_raw_data'].plain$.subscribe(x => {
        // pretend we did it...
        console.info('updated cache with fresh data');
        sbs1.unsubscribe();
    });
    subjects['data'].plain$.subscribe({
        next: render,
        error: render_error,
        complete: () => console.log('done'),
    });
    function render(data) {
        logger.group('rendering...');
        logger.log('source data', data);
        window.document.title = data.title;
        let new_html_content;
        if (!data.rows.length) {
            new_html_content = '<h2>Empty ! Please add some data...';
        }
        else {
            new_html_content = TEMPLATES.page(data);
        }
        logger.log('html generated');
        const el_content = document.querySelectorAll('#content')[0];
        el_content.innerHTML = new_html_content;
        logger.log('html replaced');
        const elems = Array.from(document.querySelectorAll('.grid'));
        const pks = elems.map(elem => new Packery(elem, {
            // options
            itemSelector: '.grid-item',
            // assist column width to clean adapt to variable-width titles
            columnWidth: 72,
            //rowHeight: 36,
            //gutter: 1,
            percentPosition: false,
            //isHorizontal: true,
            initLayout: false,
            // stamp elements
            stamp: '.stamp',
        }));
        logger.log('Packery created on all elements');
        // attach our event handlers before running the layout
        const all_layouts_done = Promise.all(pks.map(pckry => new Promise(resolve => pckry.once('layoutComplete', resolve))));
        all_layouts_done
            .then(() => {
            console.info('All packery layouts done');
            setTimeout(() => {
                //fit_text(document.querySelectorAll('.grid-item'), 0.8, { minFontSize: 5, maxFontSize: 50 })
            }, 100);
        })
            .catch(e => console.error(e));
        pks.forEach(pckry => pckry.layout());
        logger.log('Packery layout launched on all elements');
        logger.groupEnd();
    }
    function render_error(err) {
        console.error('something wrong occurred:', err);
        const el_content = document.querySelectorAll('#content')[0];
        el_content.innerHTML = 'Something wrong occured :-( (Look at the console if you are a dev)';
    }
});
//# sourceMappingURL=index.js.map