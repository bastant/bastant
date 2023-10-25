import { dasherize, inflect, tableize } from "inflection";
var MATCH_PX = /([0-9]+)px$/;
var BASE_FONT_SIZE = 16;
function toRem(value, base) {
    if (base === void 0) { base = BASE_FONT_SIZE; }
    return value / base;
}
export function normalizeConfig(config, options) {
    if (options === void 0) { options = {}; }
    var sections = [];
    for (var key in config) {
        sections.push(normalizeSection(key, config[key]));
    }
    return sections;
}
export function normalizeSection(section, entry, options) {
    if (options === void 0) { options = {}; }
    var single = dasherize(inflect(tableize(section), 1));
    var dashed = dasherize(tableize(section));
    for (var key in entry) {
        var value = entry[key];
        if (typeof value == "string") {
            if (options.pxtoRem && !value.includes(" ")) {
                var match = value.match(MATCH_PX);
                if (match) {
                    var n = parseInt(match[1]);
                    value = toRem(n, options.baseFont) + "rem";
                }
            }
        }
        entry[key] = value;
    }
    return [
        { cssName: dashed, singular: single, name: section },
        entry,
    ];
}
