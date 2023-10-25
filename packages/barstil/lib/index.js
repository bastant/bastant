var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { loadConfig } from "./config.js";
import { normalizeConfig } from "./utils.js";
import { create as createScripts } from "./javascript.js";
import { create as createSass } from "./sass.js";
import Path from "node:path";
export function create(options) {
    return __awaiter(this, void 0, void 0, function () {
        var cfg, sections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadConfig(options.path)];
                case 1:
                    cfg = _a.sent();
                    sections = normalizeConfig(cfg, {
                        pxtoRem: options.rem,
                    });
                    return [4 /*yield*/, createSass(sections, {
                            path: Path.join(options.output.sass, "_config.scss"),
                            classes: options.helpers
                                ? Path.join(options.output.script, "helpers.module.scss")
                                : void 0,
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, createScripts(sections, {
                            ts: options.typescript,
                            path: Path.join(options.output.script, "config" + (options.typescript ? ".ts" : ".js")),
                            classes: options.helpers
                                ? Path.join(options.output.script, "helpers" + options.typescript ? ".ts" : ".js")
                                : void 0,
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// import * as fs from "node:fs/promises";
// import jsonschema from "jsonschema";
// import Path from "node:path";
// import * as url from "url";
// import { dasherize, inflect, tableize, underscore } from "inflection";
// const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
// const MATCH_PX = /([0-9]+)px$/;
// const BASE_FONT_SIZE = 16;
// function toRem(value: number) {
//   return value / BASE_FONT_SIZE;
// }
// export interface Options {
//   /// Path to config
//   path: string;
//   /// Convert pixels to rem
//   rem?: boolean;
//   ///
//   typescript?: boolean;
//   output: {
//     script: string;
//     sass: string;
//   };
// }
// interface Config {
//   colors: Record<string, string | number>;
//   breakpoints: Record<string, string>;
//   spacings: Record<string, string | number>;
//   variables: Record<string, string | number>;
// }
// async function loadConfig(path: string): Promise<Config> {
//   const out = await fs.readFile(path, "utf-8");
//   const cfg: any = JSON.parse(out);
//   const schema = JSON.parse(
//     await fs.readFile(Path.join(__dirname, "../schema.json"), "utf-8")
//   );
//   const ret = jsonschema.validate(cfg, schema, { throwAll: true });
//   return ret.instance;
// }
// export async function create(options: Options) {
//   const cfg = await loadConfig(options.path);
//   const sass = [];
//   const script = [];
//   for (const section in cfg) {
//     if (section === "$schema") continue;
//     const values = (cfg as any)[section];
//     if (!Object.keys(values).length) {
//       console.log(`Section: ${section} is empty... skipping.`);
//       continue;
//     }
//     const output = createSection((cfg as any)[section], { rem: !!options.rem });
//     sass.push(createSass(section, output.sass));
//     script.push(createScript(section, output.script, !!options.typescript));
//   }
//   const styling = `
// @use 'barstil';
// ${sass.join("\n")}
// `;
//   await fs.writeFile(options.output.sass, styling);
//   await fs.writeFile(options.output.script, script.join("\n"));
//   //   console.log(`
//   // @use 'barstil';
//   // ${sass.join("\n")}
//   //   `);
//   //   console.log(`
//   // ${script.join("\n")}
//   // `);
// }
// interface CreateSectionOptions {
//   rem: boolean;
// }
// function createScript(section: string, values: string, ts: boolean) {
//   const single = dasherize(inflect(tableize(section), 1));
//   const dashed = dasherize(tableize(section));
//   const upper = underscore(section).toUpperCase();
//   const script = `
// export const ${upper} = ${values} ${ts ? " as const" : ""};
// export function ${section}(variable ${ts ? ": keyof typeof " + upper : ""}) ${
//     ts ? ": string | undefined" : ""
//   } {
//     const found = ${upper}[variable];
//     return found ? "var(--${single}-" + variable + "," + found + ")" : void 0;
//   }
// `;
//   return script;
// }
// function createSass(section: string, values: string) {
//   const single = dasherize(inflect(tableize(section), 1));
//   const dashed = dasherize(tableize(section));
//   const sass = `
// $${dashed}-map: ${values};
// @function ${single}($var) {
//   @return barstil.variable($${dashed}-map, $var, ${single});
// }`;
//   return sass;
// }
// function createSection(
//   values: Record<string, string | number>,
//   options: CreateSectionOptions
// ) {
//   const sass = [];
//   const script = [];
//   const preSass = [];
//   for (const key in values) {
//     let value = values[key];
//     if (typeof value == "string") {
//       if (options.rem && !value.includes(" ")) {
//         const match = value.match(MATCH_PX);
//         if (match) {
//           const n = parseInt(match[1]);
//           value = toRem(n) + "rem";
//         }
//       }
//     }
//     if (value.toString().includes(" ")) {
//       sass.push(`"${key}": (${value})`);
//     } else {
//       sass.push(`"${key}": ${value}`);
//     }
//     script.push(`"${key}": "${value}"`);
//   }
//   return {
//     sass: `(${sass.join(",")})`,
//     script: `{${script.join(",")}}`,
//   };
// }
