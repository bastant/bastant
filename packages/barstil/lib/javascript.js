var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { underscore, classify } from "inflection";
import dedent from "dedent";
import { VAR_MAP } from "./sass.js";
function createSection(section, values, ts) {
    var upper = underscore(section.name).toUpperCase();
    var script = dedent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  export const ", " = ", " ", ";\n  export function ", "(variable ", ") ", " {\n      const found = ", "[variable];\n      return found ? \"var(--", "-\" + variable + \",\" + found + \")\" : void 0;\n    }\n"], ["\n  export const ", " = ", " ", ";\n  export function ", "(variable ", ") ", " {\n      const found = ", "[variable];\n      return found ? \"var(--", "-\" + variable + \",\" + found + \")\" : void 0;\n    }\n"])), upper, JSON.stringify(values), ts ? " as const" : "", section.name, ts ? ": keyof typeof " + upper : "", ts ? ": string | undefined" : "", upper, section.singular);
    return script;
}
export function create(sections, options) {
    return __awaiter(this, void 0, void 0, function () {
        var files, classes;
        return __generator(this, function (_a) {
            files = [
                {
                    name: options.path,
                    content: sections
                        .map(function (section) { return createSection.apply(void 0, __spreadArray(__spreadArray([], section, false), [options.ts], false)); })
                        .join("\n"),
                },
            ];
            if (options.classes && options.ts) {
                classes = sections
                    .flatMap(function (_a) {
                    var section = _a[0], entry = _a[1];
                    if (!VAR_MAP[section.name])
                        return null;
                    var props = VAR_MAP[section.name];
                    return props.map(function (prop) {
                        if (["padding", "margin"].includes(prop)) {
                            return createDirProp(section, prop, entry);
                        }
                        else {
                            return dedent(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          .", " {\n            @include barstil.create-prop($", "-map, ", ", ", ");\n          }\n          "], ["\n          .", " {\n            @include barstil.create-prop($", "-map, ", ", ", ");\n          }\n          "])), prop, section.cssName, prop, section.name);
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
            return [2 /*return*/];
        });
    });
}
function createDirProp(section, prop, entry) {
    var directions = ["top", "bottom", "left", "right"];
    var n = prop[0];
    var cases = [];
    var interfaces = directions.map(function (m) { return "".concat(n).concat(m[0], ": keyof typeof ").concat(underscore(section.name).toUpperCase()); });
    for (var varname in entry) {
        for (var _i = 0, directions_1 = directions; _i < directions_1.length; _i++) {
            var dir = directions_1[_i];
            var d = dir[0];
            cases.push("[css['".concat(prop, "-").concat(varname, "-").concat(dir, "']]: opts.").concat(n).concat(d, " == \"").concat(varname, "\""));
        }
    }
    var interfaceName = classify(prop + "_Options");
    return dedent(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  export ", " {\n    ", "\n  }\n  export function ", "(opts: ", ") {\n    return {\n        ", "\n    }\n  }\n  "], ["\n  export ", " {\n    ", "\n  }\n  export function ", "(opts: ", ") {\n    return {\n        ", "\n    }\n  }\n  "])), interfaceName, interfaces.join(";\n  "), section.name, interfaceName, cases.join(",\n  "));
}
var templateObject_1, templateObject_2, templateObject_3;
