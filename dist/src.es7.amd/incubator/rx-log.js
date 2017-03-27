/* Log an observable's events
 * BEWARE this may instantiate the observable (if not a subject)
 * -> USE WITH CAUTION
*/
////////////////////////////////////
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const PAD_SIZE = 6;
    const start_date = Date.now();
    const zeros_for_pad = '000000';
    let auto_id = 0;
    ///////
    function to_string_but_not_too_big(x) {
        const s = (typeof x === 'undefined') ? 'undefined' : x.toString();
        const eol_index = s.indexOf('\n');
        let nice = (eol_index > 0)
            ? s.slice(0, eol_index) + '...'
            : s;
        if (nice.length > 30)
            nice = nice.slice(0, 30) + '...';
        return nice;
    }
    function generate_timestamp() {
        return `T=${(zeros_for_pad + (Date.now() - start_date)).slice(-PAD_SIZE)}`;
    }
    function log_observable(observable, id) {
        auto_id++;
        if (!observable)
            throw new Error('log_observable should be given an observable');
        id = id || `#${auto_id}`;
        observable.subscribe((value) => {
            const val_s = to_string_but_not_too_big(value);
            if (val_s !== '[object Object]')
                console.log(`${generate_timestamp()} [${id}] ..."${val_s}"`);
            else
                console.log(`${generate_timestamp()} [${id}] ...`, value);
        }, (err) => console.error(`${generate_timestamp()} [${id}] ...[Error: "${err}" !]`), () => console.log(`${generate_timestamp()} [${id}] ...[Completed]`));
    }
    exports.log_observable = log_observable;
});
////////////////////////////////////
//# sourceMappingURL=rx-log.js.map