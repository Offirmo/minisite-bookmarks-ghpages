interface LooseObservable {
    subscribe: Function;
}
declare function log_observable(observable: LooseObservable, id?: string): void;
export { LooseObservable, log_observable };
