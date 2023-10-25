import * as fs from "node:fs/promises";
import jsonschema from "jsonschema";
import Path from "node:path";
import * as url from "url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

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

export async function loadConfig(path: string): Promise<Config> {
  const out = await fs.readFile(path, "utf-8");

  const cfg: any = JSON.parse(out);

  const schema = JSON.parse(
    await fs.readFile(Path.join(__dirname, "../schema.json"), "utf-8")
  );

  delete cfg["$schema"];

  const ret = jsonschema.validate(cfg, schema, { throwAll: true });

  return ret.instance;
}
