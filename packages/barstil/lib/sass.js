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
import dedent from "dedent";
import Path from "node:path";
export var VAR_MAP = {
    //sizes: ['height', 'width', 'border-width'],
    spacings: ["padding", "margin"],
};
function createSection(section, values) {
    var sass = [];
    for (var key in values) {
        var value = values[key];
        if (value.toString().includes(" ")) {
            sass.push("\"".concat(key, "\": (").concat(value, ")"));
        }
        else {
            sass.push("\"".concat(key, "\": ").concat(value));
        }
    }
    var output = dedent(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  $", "-map: ", ";\n  @function ", "($var) {\n    @return barstil.variable($", "-map, $var, ", ");\n  }"], ["\n  $", "-map: ", ";\n  @function ", "($var) {\n    @return barstil.variable($", "-map, $var, ", ");\n  }"])), section.cssName, sass.join(", "), section.singular, section.cssName, section.singular);
    return output;
}
export function create(sections, options) {
    return __awaiter(this, void 0, void 0, function () {
        var files, classes, diff;
        return __generator(this, function (_a) {
            files = [
                {
                    name: options.path,
                    content: sections.map(function (section) { return createSection.apply(void 0, section); }).join("\n"),
                },
            ];
            if (options.classes) {
                classes = sections
                    .flatMap(function (_a) {
                    var section = _a[0], _ = _a[1];
                    if (!VAR_MAP[section.name])
                        return null;
                    var props = VAR_MAP[section.name];
                    return props.map(function (prop) {
                        if (["padding", "margin"].includes(prop)) {
                            return dedent(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          .", " {\n            @include barstil.create-dir-prop($", "-map, ", ", ", ");\n          }\n          "], ["\n          .", " {\n            @include barstil.create-dir-prop($", "-map, ", ", ", ");\n          }\n          "])), prop, section.cssName, prop, section.name);
                        }
                        else {
                            return dedent(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n          .", " {\n            @include barstil.create-prop($", "-map, ", ", ", ");\n          }\n          "], ["\n          .", " {\n            @include barstil.create-prop($", "-map, ", ", ", ");\n          }\n          "])), prop, section.cssName, prop, section.name);
                        }
                    });
                })
                    .filter(Boolean);
                diff = Path.relative(Path.dirname(options.classes), options.path);
                classes.unshift("@use \"".concat(diff, "\" show *;"), '@use "barstil";');
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
var templateObject_1, templateObject_2, templateObject_3;
