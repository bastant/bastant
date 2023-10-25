import { Section } from "./utils.js";
export declare const VAR_MAP: Record<string, string[]>;
export interface CreateOptions {
    path: string;
    classes?: string;
}
export declare function create(sections: Section[], options: CreateOptions): Promise<void>;
