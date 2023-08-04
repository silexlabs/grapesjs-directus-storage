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
import initDirectus from './directus.js';
import en from './locale/en.js';
export default (function (editor, opts) {
    if (opts === void 0) { opts = {}; }
    var options = __assign({
        i18n: {},
        // default options
    }, opts);
    initDirectus(editor, options);
    // Load i18n files
    editor.I18n && editor.I18n.addMessages(__assign({ en: en }, options.i18n));
});
