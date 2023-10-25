import { Config, Entry } from "./config.js";
import { dasherize, inflect, tableize, underscore } from "inflection";

const MATCH_PX = /([0-9]+)px$/;

const BASE_FONT_SIZE = 16;

function toRem(value: number, base = BASE_FONT_SIZE) {
  return value / base;
}

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

export function normalizeConfig(
  config: Config,
  options: Options = {}
): Section[] {
  const sections = [];

  for (const key in config) {
    sections.push(normalizeSection(key as any, config[key], options));
  }

  return sections;
}

export function normalizeSection(
  section: keyof Config,
  entry: Entry,
  options: Options = {}
): Section {
  const single = dasherize(inflect(tableize(section), 1));
  const dashed = dasherize(tableize(section));

  for (const key in entry) {
    let value = entry[key];
    if (typeof value == "string") {
      if (options.pxtoRem && !value.includes(" ")) {
        const match = value.match(MATCH_PX);
        if (match) {
          const n = parseInt(match[1]);
          value = toRem(n, options.baseFont) + "rem";
        }
      }
    }

    entry[key] = value;
  }

  return [
    { cssName: dashed, singular: single, name: section },
    entry as Record<string, string>,
  ];
}
