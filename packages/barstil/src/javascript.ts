import { dasherize, inflect, tableize, underscore, classify } from "inflection";
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
            return dedent`
          .${prop} {
            @include barstil.create-prop($${section.cssName}-map, ${prop}, ${section.name});
          }
          `;
          }
        });
      })
      .filter(Boolean);

    files.push({
      name: options.classes,
      content: classes.join("\n"),
    });
  }

  console.log(files);
}

function createDirProp(
  section: SectionName,
  prop: string,
  entry: Record<string, string | number>
) {
  const directions = ["top", "bottom", "left", "right"];
  const n = prop[0];

  const cases = [];
  const interfaces = directions.map(
    (m) => `${n}${m[0]}: keyof typeof ${underscore(section.name).toUpperCase()}`
  );
  for (const varname in entry) {
    for (const dir of directions) {
      const d = dir[0];
      cases.push(
        `[css['${prop}-${varname}-${dir}']]: opts.${n}${d} == "${varname}"`
      );
    }
  }

  const interfaceName = classify(prop + "_Options");

  return dedent`
  export ${interfaceName} {
    ${interfaces.join(";\n  ")}
  }
  export function ${section.name}(opts: ${interfaceName}) {
    return {
        ${cases.join(",\n  ")}
    }
  }
  `;
}
