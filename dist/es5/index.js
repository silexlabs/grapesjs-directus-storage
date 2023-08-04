"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var directus_1 = __importDefault(require("./directus"));
var en_1 = __importDefault(require("./locale/en"));
exports.default = (function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    var options = __assign({
        i18n: {},
        // default options
    }, opts);
    (0, directus_1.default)(editor, options);
    // Load i18n files
    editor.I18n && editor.I18n.addMessages(__assign({ en: en_1.default }, options.i18n));
});
