(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    // Loaded ready states
    var loadedStates = ['interactive', 'complete'];
    // Return Promise
    var whenDomReady = function (cb, doc) { return new Promise(function (resolve) {
        // Allow doc to be passed in as the lone first param
        if (cb && typeof cb !== 'function') {
            doc = cb;
            cb = null;
        }
        // Use global document if we don't have one
        doc = doc || window.document;
        // Handle DOM load
        var done = function () { return resolve(cb && setTimeout(cb)); };
        // Resolve now if DOM has already loaded
        // Otherwise wait for DOMContentLoaded
        if (loadedStates.includes(doc.readyState)) {
            done();
        }
        else {
            doc.addEventListener('DOMContentLoaded', done);
        }
    }); };
    // Promise chain helper
    whenDomReady.resume = function (doc) { return function (val) { return whenDomReady(doc).then(function () { return val; }); }; };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = whenDomReady;
});
//# sourceMappingURL=index.js.map