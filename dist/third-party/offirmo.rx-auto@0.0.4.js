////////////////////////////////////
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@reactivex/rxjs", "lodash"], factory);
    }
})(function (require, exports) {
    "use strict";
    const tslib_1 = require("tslib");
    const Rx = require("@reactivex/rxjs");
    const _ = require("lodash");
    const OPERATORS = {
        concat: Symbol('concat'),
        merge: Symbol('merge'),
        zip: Symbol('zip'),
    };
    exports.OPERATORS = OPERATORS;
    ////////////////////////////////////
    function uniformize_stream_definition(raw_definition, id) {
        if (!_.isString(id) && !_.isSymbol(id))
            throw new Error(`stream ids must be strings or symbols ! ("${typeof id}")`);
        let stream_def = undefined;
        if (_.isArray(raw_definition)) {
            // async style format, convert it
            stream_def = {
                id,
                dependencies: raw_definition.slice(0, -1),
                generator: raw_definition.slice(-1)[0]
            };
        }
        else if (_.isObject(raw_definition)) {
            // is it a stream definition ?
            if (raw_definition.id && _.isString(raw_definition.id) && raw_definition.dependencies && raw_definition.generator) {
                // yes
                stream_def = raw_definition;
            }
        }
        // fallback
        if (!stream_def) {
            // trivial async style format, convert it
            stream_def = {
                id,
                dependencies: [],
                generator: raw_definition
            };
        }
        if (!stream_def.generator)
            throw new Error(`stream definition "${id}" should have a generator !`);
        return stream_def;
    }
    function resolve_stream_from_static_value(stream_def) {
        const observable$ = Rx.Observable.of(stream_def.generator);
        return tslib_1.__assign({}, stream_def, { value: stream_def.generator, promise: Promise.resolve(stream_def.generator), observable$, subject$: observable$.multicast(new Rx.Subject()).refCount() });
    }
    function resolve_stream_from_promise(stream_def) {
        const observable$ = Rx.Observable.fromPromise(stream_def.generator);
        return tslib_1.__assign({}, stream_def, { promise: stream_def.generator, observable$, subject$: observable$.multicast(new Rx.Subject()).refCount() });
    }
    function resolve_stream_from_observable(stream_def) {
        const observable$ = stream_def.generator;
        return tslib_1.__assign({}, stream_def, { observable$, subject$: observable$.multicast(new Rx.Subject()).refCount() });
    }
    function resolve_stream_from_operator(stream_defs_by_id, stream_def) {
        const { id, dependencies, generator } = stream_def;
        if (!dependencies.length)
            throw new Error(`stream "${id}" operator should have dependencies !`);
        let observable$;
        switch (generator) {
            case OPERATORS.merge:
                observable$ = Rx.Observable.merge(...stream_def.dependencies
                    .map(id => stream_defs_by_id[id])
                    .map(resolvedStreamDef => resolvedStreamDef.observable$));
                break;
            default:
                throw new Error(`stream ${id}: unrecognized operator ! ${generator}`);
        }
        return tslib_1.__assign({}, stream_def, { observable$, subject$: observable$.multicast(new Rx.Subject()).refCount() });
    }
    function resolve_stream_observable(stream_defs_by_id, stream_def) {
        const { id } = stream_def;
        let { generator } = stream_def;
        const generated = _.isFunction(generator);
        console.log(`resolving stream "${id}"...`);
        if (_.isFunction(generator)) {
            // allow custom constructs. We pass full dependencies results
            const stream_deps_by_id = {};
            stream_def.dependencies.forEach(id => {
                stream_deps_by_id[id] = stream_defs_by_id[id];
            });
            // one call is allowed
            generator = generator(stream_deps_by_id);
            console.log(`from "${stream_def.id}" generator function: "${generator}"`);
        }
        if (!generator) {
            console.warn(`Warning: stream definition "${id}" generator function returned "${generator}". This will be considered a final static value.`);
        }
        if (generator && generator.then) {
            // it's a promise !
            if (!generated && stream_def.dependencies.length)
                throw new Error(`stream "${stream_def.id}" is a direct promise but has dependencies !`);
            return resolve_stream_from_promise(tslib_1.__assign({}, stream_def, { generator }));
        }
        if (generator && generator.subscribe) {
            // it's an observable !
            if (!generated && stream_def.dependencies.length)
                throw new Error(`stream "${stream_def.id}" is a direct observable but has dependencies !`);
            return resolve_stream_from_observable(tslib_1.__assign({}, stream_def, { generator }));
        }
        if (_.isSymbol(generator)) {
            switch (generator) {
                case OPERATORS.concat:
                case OPERATORS.merge:
                case OPERATORS.zip:
                    return resolve_stream_from_operator(stream_defs_by_id, tslib_1.__assign({}, stream_def, { generator }));
                default:
                    // not ours, consider it a direct sync value
                    break;
            }
        }
        if (!generated && stream_def.dependencies.length)
            throw new Error(`stream "${stream_def.id}" is a direct value but has dependencies !`);
        return resolve_stream_from_static_value(tslib_1.__assign({}, stream_def, { generator }));
    }
    function resolve_streams(stream_defs_by_id, unresolved_stream_defs) {
        const still_unresolved_stream_defs = [];
        unresolved_stream_defs.forEach(stream_def => {
            const has_unresolved_deps = stream_def.dependencies.some(stream_id => !stream_defs_by_id[stream_id].observable$);
            if (!has_unresolved_deps) {
                stream_defs_by_id[stream_def.id] = resolve_stream_observable(stream_defs_by_id, stream_def);
            }
            else {
                still_unresolved_stream_defs.push(stream_def);
            }
        });
        return still_unresolved_stream_defs;
    }
    function auto(stream_definitions) {
        const stream_defs_by_id = {};
        const stream_defs = [];
        // check and uniformize definitions...
        const stream_ids = Object.keys(stream_definitions);
        stream_ids.forEach(stream_id => {
            // uniformize definitions format
            const standardized_definition = uniformize_stream_definition(stream_definitions[stream_id], stream_id);
            stream_defs_by_id[stream_id] = standardized_definition;
            stream_defs.push(standardized_definition);
        });
        // resolve related streams
        let progress = true;
        let iteration_count = 0;
        const SAFETY_LIMIT = 25;
        let unresolved_stream_defs = stream_defs.slice();
        while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
            iteration_count++;
            const still_unresolved_stream_defs = resolve_streams(stream_defs_by_id, unresolved_stream_defs);
            progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
            unresolved_stream_defs = still_unresolved_stream_defs;
        }
        if (unresolved_stream_defs.length)
            throw new Error('deadlock resolving streams, please check dependencies !');
        const subjects = {};
        stream_ids.forEach(stream_id => {
            subjects[stream_id] = stream_defs_by_id[stream_id].subject$;
        });
        return subjects;
    }
    exports.auto = auto;
});
//# sourceMappingURL=index.js.map