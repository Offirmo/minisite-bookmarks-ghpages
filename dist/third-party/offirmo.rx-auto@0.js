////////////////////////////////////
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@reactivex/rxjs", "lodash"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Rx = require("@reactivex/rxjs");
    const _ = require("lodash");
    ////////////////////////////////////
    const OPERATORS = {
        combineLatest: Symbol('combineLatest'),
        combineLatestHash: Symbol('combineLatestHash'),
        combineLatestHashDistinctUntilChangedShallow: Symbol('combineLatestHashDistinctUntilChangedShallow'),
        concat: Symbol('concat'),
        concatDistinctUntilChanged: Symbol('concatDistinctUntilChanged'),
        distinct: Symbol('distinct'),
        distinctUntilChanged: Symbol('distinctUntilChanged'),
        merge: Symbol('merge'),
        zip: Symbol('zip'),
    };
    exports.OPERATORS = OPERATORS;
    let invocation_count = 0;
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
        stream_def.dependencies.forEach(dependency => {
            if (!_.isString(dependency) && !_.isSymbol(dependency))
                throw new Error(`dependencies must be stream ids, which must be strings or symbols ! ("${typeof dependency}")`);
        });
        return stream_def;
    }
    function subjects_for(observable$, initial_behavior_value) {
        const plain$ = observable$.multicast(new Rx.Subject()).refCount();
        return {
            plain$,
            behavior$: observable$.multicast(new Rx.BehaviorSubject(initial_behavior_value)).refCount(),
            async$: observable$.multicast(new Rx.AsyncSubject()).refCount(),
        };
    }
    function resolve_stream_from_static_value(stream_def) {
        const observable$ = Rx.Observable.of(stream_def.generator);
        return Object.assign({}, stream_def, { value: stream_def.generator, promise: Promise.resolve(stream_def.generator), observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_promise(stream_def) {
        const observable$ = Rx.Observable.fromPromise(stream_def.generator);
        return Object.assign({}, stream_def, { promise: stream_def.generator, observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_observable(stream_def) {
        const observable$ = stream_def.generator;
        return Object.assign({}, stream_def, { observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_from_operator(injected, stream_defs_by_id, stream_def) {
        const { id, dependencies, generator } = stream_def;
        if (!dependencies.length)
            throw new Error(`stream "${id}" operator should have dependencies !`);
        let observable$;
        const dependencies$ = stream_def.dependencies
            .map(id => stream_defs_by_id[id])
            .map(resolvedStreamDef => resolvedStreamDef.observable$);
        injected.logger.log(`Applying an operator...`, generator, stream_def.dependencies, dependencies$);
        switch (generator) {
            case OPERATORS.combineLatest:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.combineLatest(...dependencies$);
                break;
            case OPERATORS.combineLatestHashDistinctUntilChangedShallow:
            case OPERATORS.combineLatestHash:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.combineLatest(...dependencies$).map(value_array => {
                    const hash = {};
                    dependencies.forEach((key, index) => {
                        hash[key] = value_array[index];
                    });
                    return hash;
                });
                if (generator === OPERATORS.combineLatestHashDistinctUntilChangedShallow) {
                    debugger;
                    console.error('activating combineLatestHashDistinctUntilChangedShallow');
                    observable$ = observable$.distinctUntilChanged((a, b) => {
                        debugger;
                        const x = shallowCompareHash1L(a, b);
                        console.warn('shallow', x);
                        return x;
                    });
                }
                break;
            case OPERATORS.concat:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.concat(...dependencies$);
                break;
            case OPERATORS.concatDistinctUntilChanged:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.concat(...dependencies$).distinctUntilChanged();
                break;
            case OPERATORS.distinct:
                if (dependencies.length > 1)
                    throw new Error(`stream "${id}" filtering operator should have exactly 1 dependency !`);
                observable$ = dependencies$[0].distinct();
                break;
            case OPERATORS.distinctUntilChanged:
                if (dependencies.length > 1)
                    throw new Error(`stream "${id}" filtering operator should have exactly 1 dependency !`);
                observable$ = dependencies$[0].distinctUntilChanged();
                break;
            case OPERATORS.merge:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.merge(...dependencies$);
                break;
            case OPERATORS.zip:
                if (dependencies.length < 2)
                    throw new Error(`stream "${id}" combining operator should have more than 1 dependency !`);
                observable$ = Rx.Observable.zip(...dependencies$);
                break;
            default:
                throw new Error(`stream ${id}: unrecognized or not implemented operator ! ${generator.toString()}`);
        }
        return Object.assign({}, stream_def, { observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_observable(injected, stream_defs_by_id, stream_def) {
        const { id } = stream_def;
        let { generator } = stream_def;
        const generated = _.isFunction(generator);
        injected.logger.log(`resolving stream "${id}"...`, { generated, generator });
        if (_.isFunction(generator)) {
            // allow custom constructs. We pass full dependencies results
            const stream_deps_by_id = {};
            stream_def.dependencies.forEach(id => {
                stream_deps_by_id[id] = stream_defs_by_id[id];
            });
            // one call is allowed
            generator = generator(stream_deps_by_id);
            injected.logger.log(`from "${stream_def.id}" generator function: "${generator}"`);
        }
        if (!generator) {
            injected.logger.warn(`Warning: stream definition "${id}" generator function returned "${generator}". This will be considered a final static value.`);
        }
        if (generator && generator.then) {
            // it's a promise !
            if (!generated && stream_def.dependencies.length)
                throw new Error(`stream "${stream_def.id}" is a direct promise but has dependencies !`);
            return resolve_stream_from_promise(Object.assign({}, stream_def, { generator }));
        }
        if (generator && generator.subscribe) {
            // it's an observable !
            if (!generated && stream_def.dependencies.length)
                throw new Error(`stream "${stream_def.id}" is a direct observable but has dependencies !`);
            return resolve_stream_from_observable(Object.assign({}, stream_def, { generator }));
        }
        if (_.isSymbol(generator)) {
            switch (generator) {
                case OPERATORS.combineLatest:
                case OPERATORS.combineLatestHash:
                case OPERATORS.combineLatestHashDistinctUntilChangedShallow:
                case OPERATORS.concat:
                case OPERATORS.concatDistinctUntilChanged:
                case OPERATORS.distinct:
                case OPERATORS.distinctUntilChanged:
                case OPERATORS.merge:
                case OPERATORS.zip:
                    return resolve_stream_from_operator(injected, stream_defs_by_id, Object.assign({}, stream_def, { generator }));
                default:
                    // not ours, consider it a direct sync value
                    break;
            }
        }
        if (!generated && stream_def.dependencies.length)
            throw new Error(`stream "${stream_def.id}" is a direct value but has dependencies !`);
        return resolve_stream_from_static_value(Object.assign({}, stream_def, { generator }));
    }
    function resolve_streams(injected, stream_defs_by_id, unresolved_stream_defs) {
        const still_unresolved_stream_defs = [];
        unresolved_stream_defs.forEach(stream_def => {
            const has_unresolved_deps = stream_def.dependencies.some(stream_id => !stream_defs_by_id[stream_id].observable$);
            if (!has_unresolved_deps) {
                injected.logger.groupCollapsed(`resolving stream "${stream_def.id}"…`);
                stream_defs_by_id[stream_def.id] = resolve_stream_observable(injected, stream_defs_by_id, stream_def);
                injected.logger.groupEnd();
            }
            else {
                still_unresolved_stream_defs.push(stream_def);
            }
        });
        return still_unresolved_stream_defs;
    }
    function auto(stream_definitions, options = {}) {
        invocation_count++;
        const injected = {
            debug_id: options.debug_id || `rx-auto invocation #${invocation_count}…`,
            logger: options.logger || {
                groupCollapsed: () => undefined,
                groupEnd: () => undefined,
                log: () => undefined,
                info: () => undefined,
                warn: () => undefined,
                error: () => undefined,
            },
        };
        injected.logger.groupCollapsed(injected.debug_id);
        injected.logger.log('Starting… params=', { stream_definitions, options });
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
        injected.logger.info(`Found ${stream_defs.length} stream definitions:`, Object.keys(stream_defs_by_id));
        // do some global checks
        injected.logger.log('Starting a global check…');
        stream_ids.forEach(stream_id => {
            const dependencies = stream_defs_by_id[stream_id].dependencies;
            dependencies.forEach(dependency => {
                if (!stream_ids.includes(dependency))
                    throw new Error(`Stream definition for "${stream_id}" references an unknown dependency "${dependency}" !`);
            });
        });
        injected.logger.log(`Check OK. State so far =`, stream_defs_by_id);
        // resolve related streams
        let progress = true;
        let iteration_count = 0;
        const SAFETY_LIMIT = 25;
        let unresolved_stream_defs = stream_defs.slice();
        injected.logger.groupCollapsed('Streams resolution…');
        while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
            iteration_count++;
            const still_unresolved_stream_defs = resolve_streams(injected, stream_defs_by_id, unresolved_stream_defs);
            progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
            unresolved_stream_defs = still_unresolved_stream_defs;
        }
        if (unresolved_stream_defs.length)
            throw new Error('deadlock resolving streams, please check dependencies !');
        injected.logger.groupEnd();
        const subjects = {};
        stream_ids.forEach(stream_id => {
            subjects[stream_id] = stream_defs_by_id[stream_id].subjects;
        });
        injected.logger.groupEnd();
        return subjects;
    }
    exports.auto = auto;
    ////////////////////////////////////
    // convenience function
    function shallowCompareHash1L(a, b) {
        debugger;
        const ka = Reflect.ownKeys(a);
        const kb = Reflect.ownKeys(b);
        if (_.difference(ka, kb).length)
            return false;
        return ka.every(k => a[k] === b[k]);
    }
    exports.shallowCompareHash1L = shallowCompareHash1L;
});
//# sourceMappingURL=index.js.map