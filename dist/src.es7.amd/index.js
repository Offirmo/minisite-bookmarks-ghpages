define(["require", "exports", "rxjs", "packery"], function (require, exports, rxjs_1) {
    "use strict";
    const CONSTS = {
        LS_KEYS: {
            last_successful_raw_data: 'minisite-bookmarks.last_successful_raw_data',
        }
    };
    // determine vault id
    const VAULT_ID = 'demo';
    // create observables
    const O_latest_cached_raw = rxjs_1.Observable.create(observer => {
        const data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data);
        if (data)
            observer.onNext(data);
    });
    const O_latest_fetched_raw = rxjs_1.Observable.create(observer => {
        // TODO fetch
    });
    const latest_model = null;
    const latest_raw = null;
    const latest_fetched_raw = null;
    ///
    function fetch_content(vault_id) {
        return fetch(`content/${vault_id}.markdown`)
            .then(res => res.text())
            .then();
    }
    function fetch_raw_content(vault_id) {
        return fetch(`content/${vault_id}.markdown`)
            .then(res => res.text());
    }
    //import { factory as state_factory } from './state'
    //import * as tachyons from 'tachyons'
    /*
    declare var Packery:
    import { Packery } from 'packery'
    */
    /*
    var pckry = new Packery('.pckry', {
        // options...
    })
    */
    console.log('App: Hello world ! XX');
});
//state_factory()
//# sourceMappingURL=index.js.map