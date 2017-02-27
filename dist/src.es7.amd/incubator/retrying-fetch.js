define(["require", "exports", "typescript-string-enums"], function (require, exports, typescript_string_enums_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const RetryScheme = typescript_string_enums_1.Enum('periodic', 'linear', 'geometric');
    exports.RetryScheme = RetryScheme;
    const DEFAULT_OPTIONS = {
        response_should_be_ok: false,
        max_try_count: 0,
        initial_retry_interval_ms: 1000,
        max_retry_interval_ms: 3600 * 1000,
        retry_scheme: RetryScheme.geometric,
    };
    function retrying_fetch(param1, param2, options) {
        options = Object.assign({}, DEFAULT_OPTIONS, options);
        return new Promise((resolve, reject) => {
            let try_count = 0;
            let interval_before_retry_ms = 1;
            function attempt_resolution() {
                try_count++;
                console.log(`fetch "${param1} attempt #${try_count}...`, options);
                fetch(param1, param2)
                    .then((res) => {
                    if (!res.ok && options.response_should_be_ok)
                        throw new Error('fetch failure on non-network error (ok = false) !');
                    console.log(`fetch "${param1} attempt #${try_count} succeeded.`);
                    resolve(res);
                })
                    .catch(err => {
                    console.log(`fetch "${param1} attempt #${try_count} failed !`, err);
                    if (options.max_try_count && try_count >= options.max_try_count)
                        return reject(err);
                    if (interval_before_retry_ms < options.max_retry_interval_ms) {
                        switch (options.retry_scheme) {
                            case RetryScheme.periodic:
                                interval_before_retry_ms = options.initial_retry_interval_ms;
                                break;
                            case RetryScheme.linear:
                                interval_before_retry_ms = options.initial_retry_interval_ms * try_count;
                                break;
                            case RetryScheme.geometric:
                            default:
                                interval_before_retry_ms = try_count === 1
                                    ? options.initial_retry_interval_ms
                                    : interval_before_retry_ms * 2;
                                break;
                        }
                    }
                    interval_before_retry_ms = Math.min(options.max_retry_interval_ms, interval_before_retry_ms);
                    console.log(`fetch "${param1} attemp #${try_count} failed ! Will retry in ${interval_before_retry_ms}`);
                    setTimeout(attempt_resolution, interval_before_retry_ms);
                });
            }
            attempt_resolution();
        });
    }
    exports.retrying_fetch = retrying_fetch;
});
//# sourceMappingURL=retrying-fetch.js.map