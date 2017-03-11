import { Data } from './types';
interface ParserOptions {
    logger: Console;
}
declare function factory(raw_options: Partial<ParserOptions>): {
    decrypt_if_needed_then_parse_data: (raw_data: string, password?: string) => Data;
};
export { ParserOptions, factory };
