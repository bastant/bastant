export type Entry = Record<string, string | number>;
export interface Config {
    colors: Entry;
    breakpoints: Entry;
    spacings: Entry;
    sizes: Entry;
    lineHeights: Entry;
    fontSizes: Entry;
    fontWeights: Entry;
    shadows: Entry;
    radii: Entry;
    zIndices: Entry;
    variables: Entry;
}
export declare function loadConfig(path: string): Promise<Config>;
