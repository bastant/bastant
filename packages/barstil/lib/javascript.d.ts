import { Section } from "./utils.js";
export interface CreateOptions {
    ts?: boolean;
    path: string;
    classes?: string;
}
export declare function create(sections: Section[], options: CreateOptions): Promise<void>;
