declare type Options = {
    [k: string]: number | string | string[];
};
declare function parse(location: Location): Options;
export { Options, parse };
