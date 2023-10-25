import {
  dasherize,
  inflect,
  tableize,
  underscore,
  classify,
  camelize,
} from "inflection";
import { Config } from "./config.js";
import { Section, SectionName } from "./utils.js";
import dedent from "dedent";
import { VAR_MAP } from "./sass.js";

function createSection(
  section: SectionName,
  values: Record<string, number | string>,
  ts: boolean
) {
  const upper = underscore(section.name).toUpperCase();
  const script = dedent`
  export const ${upper} = ${JSON.stringify(values)} ${ts ? " as const" : ""};
  export function ${section.name}(variable ${
    ts ? ": keyof typeof " + upper : ""
  }) ${ts ? ": string | undefined" : ""} {
      const found = ${upper}[variable];
      return found ? "var(--${
        section.singular
      }-" + variable + "," + found + ")" : void 0;
    }
`;

  return script;
}

export interface CreateOptions {
  ts?: boolean;
  path: string;
  classes?: string;
}

export async function create(sections: Section[], options: CreateOptions) {
  const files = [
    {
      name: options.path,
      content: sections
        .map((section) => createSection(...section, options.ts))
        .join("\n"),
    },
  ];

  if (options.classes && options.ts) {
    const classes = sections
      .flatMap(([section, entry]) => {
        if (!VAR_MAP[section.name]) return null;

        const props = VAR_MAP[section.name];

        return props.map((prop) => {
          if (["padding", "margin"].includes(prop)) {
            return createDirProp(section, prop, entry);
          } else {
            return createProp(section, prop, entry);
          }
        });
      })
      .filter(Boolean);

    classes.unshift(dedent`
      import {SPACINGS, FONT_WEIGHTS, COLORS, FONT_SIZES} from "./config.js";
      import css from "./helpers.module.scss";
      `);

    files.push({
      name: options.classes,
      content: classes.join("\n"),
    });
  }

  return files;
}

function createProp(
  section: SectionName,
  prop: string,
  entry: Record<string, string | number>
) {
  const cases = [];

  for (const varname in entry) {
    cases.push(`case "${varname}": return css["${prop}-${varname}"];`);
  }

  const typeName = classify(prop.replace(/\-/, "_"));

  return dedent`
  export type ${typeName} = keyof typeof ${underscore(
    section.name
  ).toUpperCase()}
  export function ${camelize(
    prop.replace(/\-/, "_"),
    true
  )}(opts: ${typeName}) {
    switch (opts) {
      ${cases.join("\n")}
      default: return void 0
    }
  }
  `;
}

function createDirProp(
  section: SectionName,
  prop: string,
  entry: Record<string, string | number>
) {
  const directions = ["top", "bottom", "left", "right"];
  const n = prop[0];

  const typeName = classify(prop.replace(/\-/, "_"));

  const cases = [];
  const interfaces = directions.map((m) => `${n}${m[0]}?: ${typeName}`);

  interfaces.push(`${n}?: ${typeName}`);

  for (const varname in entry) {
    cases.push(`[css['${prop}-${varname}']]: opts.${n} == "${varname}"`);
    for (const dir of directions) {
      const d = dir[0];
      cases.push(
        `[css['${prop}-${varname}-${dir}']]: opts.${n}${d} == "${varname}"`
      );
    }
  }

  const interfaceName = classify(prop + "_Options");

  return dedent`
  export type ${typeName} = keyof typeof ${underscore(
    section.name
  ).toUpperCase()};
  export interface ${interfaceName} {
    ${interfaces.join(";\n  ")}
  }
  export function ${camelize(
    prop.replace(/\-/, "_"),
    true
  )}(opts: ${interfaceName}) {
    return {
        ${cases.join(",\n  ")}
    }
  }
  `;
}
