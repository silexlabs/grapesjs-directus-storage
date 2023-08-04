import initDirectus from './directus'
import en from './locale/en'

export default (editor, opts = {}) => {
    const options = { ...{
        i18n: {},
    // default options
    },  ...opts }

    initDirectus(editor, options)

    // Load i18n files
    editor.I18n && editor.I18n.addMessages({
        en,
        ...options.i18n,
    })
}
