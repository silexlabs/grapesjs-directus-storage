import initDirectus from './directus.js';
import en from './locale/en.js';
export default (editor, opts = {}) => {
    const options = Object.assign({
        i18n: {},
        // default options
    }, opts);
    initDirectus(editor, options);
    // Load i18n files
    editor.I18n && editor.I18n.addMessages(Object.assign({ en }, options.i18n));
};
