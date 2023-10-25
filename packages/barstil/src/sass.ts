import { Section, SectionName } from "./utils.js";
import dedent from "dedent";
import Path from "node:path";

export const VAR_MAP: Record<string, string[]> = {
  //sizes: ['height', 'width', 'border-width'],
  spacings: ["padding", "margin"],
  fontWeights: ["font-weight"],
  fontSizes: ["font-size"],
  colors: ["color", "background-color"],
};

function createSection(
  section: SectionName,
  values: Record<string, string | number>
) {
  const sass = [];

  for (const key in values) {
    let value = values[key];

    if (value.toString().includes(" ")) {
      sass.push(`"${key}": (${value})`);
    } else {
      sass.push(`"${key}": ${value}`);
    }
  }

  const output = dedent`
  $${section.cssName}-map: (${sass.join(", ")});
  @function ${section.singular}($var) {
    @return barstil.variable($${section.cssName}-map, $var, ${
    section.singular
  });
  }`;
  return output;
}

export interface CreateOptions {
  path: string;
  classes?: string;
}

export async function create(sections: Section[], options: CreateOptions) {
  const files = [
    {
      name: options.path,
      content: dedent`
      @use '@bastant/barstil';
      ${sections.map((section) => createSection(...section)).join("\n")}
      `,
    },
  ];

  if (options.classes) {
    const classes = sections
      .flatMap(([section, _]) => {
        if (!VAR_MAP[section.name]) return null;

        const props = VAR_MAP[section.name];

        return props.map((prop) => {
          if (["padding", "margin"].includes(prop)) {
            return dedent`
          .${prop} {
            @include barstil.create-dir-prop($${section.cssName}-map, ${prop}, ${section.name});
          }
          `;
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

    let diff = Path.relative(Path.dirname(options.classes), options.path);

    classes.unshift(`@use "${diff}" as *;`, '@use "@bastant/barstil";');

    files.push({
      name: options.classes!,
      content: classes.join("\n"),
    });
  }

  return files;
}
