export interface Options {
    path: string;
    rem?: boolean;
    typescript?: boolean;
    helpers?: boolean;
    output: {
        script: string;
        sass: string;
    };
}
export declare function create(options: Options): Promise<void>;
