import { Enum } from "typescript-string-enums";
declare const RetryScheme: {
    periodic: "periodic";
    linear: "linear";
    geometric: "geometric";
};
declare type RetryScheme = Enum<typeof RetryScheme>;
interface RetryingFetchOptions {
    response_should_be_ok?: boolean;
    max_try_count?: number;
    initial_retry_interval_ms?: number;
    max_retry_interval_ms?: number;
    retry_scheme?: RetryScheme;
}
declare function retrying_fetch<T>(param1: any, param2: any, options: RetryingFetchOptions): Promise<T>;
export { RetryScheme, RetryingFetchOptions, retrying_fetch };
