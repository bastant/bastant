import { Config, Entry } from "./config.js";
export interface Options {
    pxtoRem?: boolean;
    baseFont?: number;
}
export interface SectionName {
    cssName: string;
    singular: string;
    name: string;
}
export type Section = [SectionName, Record<string, string | number>];
export declare function normalizeConfig(config: Config, options?: Options): Section[];
export declare function normalizeSection(section: keyof Config, entry: Entry, options?: Options): Section;
