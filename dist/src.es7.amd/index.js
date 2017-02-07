define(["require", "exports", "typescript-string-enums", "@offirmo/rx-auto", "./incubator/retrying-fetch", "./incubator/rx-log", "packery"], function (require, exports, typescript_string_enums_1, rx_auto_1, retrying_fetch_1, rx_log_1) {
    "use strict";
    ////////////////////////////////////
    //////////// CONSTANTS ////////////
    const CONSTS = {
        LS_KEYS: {
            last_successful_raw_config: 'minisite-bookmark.last_successful_raw_config',
            last_successful_raw_data: 'minisite-bookmark.last_successful_raw_data',
            last_successful_password: 'minisite-bookmark.last_successful_password',
        },
        REPO_URL: 'https://github.com/Offirmo/minisite-w',
    };
    ////////////////////////////////////
    function get_vault_id() {
        return 'client01';
    }
    function fetch_raw_data(vault_id) {
        return retrying_fetch_1.retrying_fetch(`content/${vault_id}.markdown`, undefined, { response_should_be_ok: true })
            .then(res => res.text());
    }
    function get_cached_raw_data(vault_id) {
        return localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data);
    }
    ////////////////////////////////////
    exports.Status = typescript_string_enums_1.Enum("RUNNING", "STOPPED");
    const subjects = rx_auto_1.auto({
        vault_id: get_vault_id(),
        cached_raw_data: ['vault_id', (deps) => get_cached_raw_data(deps['vault_id'].value)],
        fresh_raw_data: ['vault_id', (deps) => fetch_raw_data(deps['vault_id'].value)],
        raw_data: ['cached_raw_data', 'fresh_raw_data', rx_auto_1.OPERATORS.merge]
    });
    for (let id in subjects) {
        //console.log(`subject ${id}`)
        rx_log_1.log_observable(subjects[id], id);
    }
    ////////////////////////////////////
    // actions
    const sbs1 = subjects['fresh_raw_data'].subscribe(x => {
        // pretend we did it...
        console.info('updated cache with fresh data:', x);
        sbs1.unsubscribe();
    });
    console.log('App: Hello world ! XX');
});
//state_factory()
//# sourceMappingURL=index.js.map