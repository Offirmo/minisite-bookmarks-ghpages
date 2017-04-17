////////////////////////////////////
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@reactivex/rxjs", "lodash", "./operators"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Rx = require("@reactivex/rxjs");
    const _ = require("lodash");
    const operators_1 = require("./operators");
    exports.Operator = operators_1.Operator;
    ////////////////////////////////////
    // to auto-name rx-auto invocations, for debug
    let invocation_count = 0;
    const default_dependencies = {
        SAFETY_LIMIT: 25,
        debug_id: '???',
        logger: {
            groupCollapsed: () => undefined,
            groupEnd: () => undefined,
            log: () => undefined,
            info: () => undefined,
            warn: () => undefined,
            error: () => undefined,
        },
        validate: true,
    };
    ////////////////////////////////////
    function is_correct_stream_id(id) {
        return _.isString(id) || _.isSymbol(id);
    }
    function uniformize_stream_definition(raw_definition, id) {
        if (!is_correct_stream_id(id))
            throw new Error(`stream ids must be strings or symbols ! ("${typeof id}")`);
        let stream_def;
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
        stream_def.dependencies.forEach(dependency_id => {
            if (!is_correct_stream_id(dependency_id))
                throw new Error(`dependencies must be stream ids, which must be strings or symbols ! ("${typeof dependency_id}")`);
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
        const { id, dependencies, generator: operator } = stream_def;
        if (!dependencies.length)
            throw new Error(`stream "${id}" operator should have dependencies !`);
        let observable$;
        const dependencies$ = stream_def.dependencies
            .map(id => stream_defs_by_id[id])
            .map(resolvedStreamDef => resolvedStreamDef.observable$);
        injected.logger.log(`Applying operators...`, stream_def.dependencies, dependencies$);
        observable$ = operator.apply(...dependencies$);
        return Object.assign({}, stream_def, { observable$, subjects: subjects_for(observable$, stream_def.initialValue) });
    }
    function resolve_stream_observable(dependencies, stream_defs_by_id, stream_def) {
        const { logger } = dependencies;
        const { id } = stream_def;
        let { generator } = stream_def;
        const generated = _.isFunction(generator);
        logger.log(`resolving stream "${id}"...`, { generated, generator });
        if (_.isFunction(generator)) {
            // allow custom constructs. We pass full dependencies results
            const stream_deps_by_id = {};
            stream_def.dependencies.forEach(id => {
                stream_deps_by_id[id] = stream_defs_by_id[id];
            });
            // one call is allowed
            generator = generator(stream_deps_by_id);
            logger.log(`from "${stream_def.id}" generator function: "${generator}"`);
        }
        if (!generator) {
            logger.warn(`Warning: stream definition "${id}" generator function returned "${generator}". This will be considered a final static value.`);
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
        if (operators_1.isOperator(generator))
            return resolve_stream_from_operator(dependencies, stream_defs_by_id, Object.assign({}, stream_def, { generator }));
        if (!generated && stream_def.dependencies.length)
            throw new Error(`stream "${stream_def.id}" is a direct value but has dependencies !`);
        return resolve_stream_from_static_value(Object.assign({}, stream_def, { generator }));
    }
    function resolve_streams(dependencies, stream_defs_by_id, unresolved_stream_defs) {
        const { logger } = dependencies;
        const still_unresolved_stream_defs = [];
        unresolved_stream_defs.forEach(stream_def => {
            const has_unresolved_deps = stream_def.dependencies.some(stream_id => !stream_defs_by_id[stream_id].observable$);
            if (!has_unresolved_deps) {
                if (logger.groupCollapsed)
                    logger.groupCollapsed(`resolving stream "${stream_def.id}"…`);
                stream_defs_by_id[stream_def.id] = resolve_stream_observable(dependencies, stream_defs_by_id, stream_def);
                if (logger.groupEnd)
                    logger.groupEnd();
            }
            else {
                still_unresolved_stream_defs.push(stream_def);
            }
        });
        return still_unresolved_stream_defs;
    }
    function auto(stream_definitions, partial_dependencies = {}) {
        invocation_count++;
        const dependencies = Object.assign({}, default_dependencies, { debug_id: `rx-auto invocation #${invocation_count}…` }, partial_dependencies);
        const { SAFETY_LIMIT, debug_id, logger } = dependencies;
        if (logger.groupCollapsed)
            logger.groupCollapsed(debug_id);
        logger.log('Starting… params=', { stream_definitions, dependencies });
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
        logger.info(`Found ${stream_defs.length} stream definitions:`, Object.keys(stream_defs_by_id));
        // do some global checks
        logger.log('Starting a global check…');
        stream_ids.forEach(stream_id => {
            const dependencies = stream_defs_by_id[stream_id].dependencies;
            dependencies.forEach(dependency => {
                if (!stream_ids.includes(dependency))
                    throw new Error(`Stream definition for "${stream_id}" references an unknown dependency "${dependency}" !`);
            });
        });
        logger.log(`Check OK. State so far =`, stream_defs_by_id);
        // resolve related streams
        let progress = true;
        let iteration_count = 0;
        let unresolved_stream_defs = stream_defs.slice();
        if (logger.groupCollapsed)
            logger.groupCollapsed('Streams resolution…');
        while (unresolved_stream_defs.length && progress && iteration_count < SAFETY_LIMIT) {
            iteration_count++;
            const still_unresolved_stream_defs = resolve_streams(dependencies, stream_defs_by_id, unresolved_stream_defs);
            progress = still_unresolved_stream_defs.length < unresolved_stream_defs.length;
            unresolved_stream_defs = still_unresolved_stream_defs;
        }
        if (unresolved_stream_defs.length)
            throw new Error('deadlock resolving streams, please check dependencies !');
        if (logger.groupEnd)
            logger.groupEnd();
        const subjects = {};
        stream_ids.forEach(stream_id => {
            subjects[stream_id] = stream_defs_by_id[stream_id].subjects;
        });
        if (logger.groupEnd)
            logger.groupEnd();
        return subjects;
    }
    exports.auto = auto;
});
//# sourceMappingURL=index.js.map