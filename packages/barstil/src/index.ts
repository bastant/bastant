import { loadConfig } from "./config.js";
import { normalizeConfig } from "./utils.js";
import { create as createScripts } from "./javascript.js";
import { create as createSass } from "./sass.js";

import Path from "node:path";

export interface Options {
  /// Path to config
  path: string;
  /// Convert pixels to rem
  rem?: boolean;
  ///
  typescript?: boolean;
  helpers?: boolean;
  output: {
    script: string;
    sass: string;
  };
}

export async function create(options: Options) {
  const cfg = await loadConfig(options.path);

  const sections = normalizeConfig(cfg, {
    pxtoRem: options.rem,
  });

  await createSass(sections, {
    path: Path.join(options.output.sass, "_config.scss"),
    classes: options.helpers
      ? Path.join(options.output.script, "helpers.module.scss")
      : void 0,
  });

  await createScripts(sections, {
    ts: options.typescript,
    path: Path.join(
      options.output.script,
      "config" + (options.typescript ? ".ts" : ".js")
    ),
    classes: options.helpers
      ? Path.join(
          options.output.script,
          "helpers" + options.typescript ? ".ts" : ".js"
        )
      : void 0,
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
