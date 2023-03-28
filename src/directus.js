import grapesjs from 'grapesjs/dist/grapes.min.js'
import { Directus } from '@directus/sdk'

// **
// Give access to the current user (data from directus)
// This will be accessible after editor.on('login:success')
export let user = null

/**
 * Define the plugin
 * @param opts.collection: name of the directus collection to hold silex website data
 * @param opts.assets: the path to directus assets folder
 */
export default grapesjs.plugins.add('@silexlabs/grapesjs-directus-storage', (editor, opts) => {
    // Default config
    const options = {
        collection: 'silex',
        assets: '/assets',
        autosave: editor.StorageManager.config.autosave,
        ...opts,
    }

    if(!options.directusUrl) {
        throw new Error('Option `directusUrl` is required')
    }

    // Disable autosave while not logged in
    editor.StorageManager.config.autosave = false

    // Create directus client
    const directus = new Directus(options.directusUrl)

    // Grapesjs custom storage to use directus collection to store the website data
    editor.Storage.add('directus', {
        store: (data) => store(editor, directus, options, data),
        load: () => load(editor, directus, options),
    })

    // Commands
    editor.Commands.add('login', () => login(editor, directus, options))
    editor.Commands.add('logout', () => logout(editor, directus))

    // Custom asset manager to upload assets to directus
    // from grapesjs asset manager UI
    editor.AssetManager.config.uploadFile = uploadFile(editor, directus, options)
    editor.on('asset:open', () => loadAssets(editor, directus, options))

    // Load content when loggedin
    editor.on('login:success', () => editor.load())

    // Login immediately
    editor.runCommand('login')
})

// **
// AssetManager functions
async function loadAssets(editor, directus, options) {
    const { data } = await directus.files.readByQuery({
        limit: -1,
        sort: ['-uploaded_on'],
    })
    data.forEach(image => editor.AssetManager.add({
        ...image,
        src: `${options.directusUrl}${options.assets}/${image.filename_disk}`,
    }))
}

function uploadFile(editor, directus, options) {
    return async function(e) {
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files
        const formData = new FormData()
        for(const i in files) {
            formData.append('file-'+i, files[i])
        }
        const results = await directus.files.createOne(formData)
    // When uploading 1 asset only, results is an object instead of array
    // Make it an array in any case
    ;[].concat(results)
            .forEach(image => {
                // Keep only the necessary fields
                // Store the image info in grapesjs data structure
                editor.AssetManager.add({
                    ...image,
                    src: `${options.directusUrl}${options.assets}/${image.filename_disk}`,
                })
            })
    }
}

// **
// Storage functions
async function store(editor, directus, options, data) {
    try {
        /* eslint-disable-next-line no-unused-vars */
        const { assets, ...saved } = data
        const result = await directus.items(options.collection).createOne({
            ...saved,
            user_updated: user?.id,
            date_updated: new Date(),
        })
        return result
    } catch (err) {
        console.error(err)
    }
}

function parseIfNeeded(strOrElse) {
    return typeof strOrElse == 'string' ? JSON.parse(strOrElse) : strOrElse
}

async function load(editor, directus, options) {
    try {
        const results = await directus.items(options.collection).readByQuery({
            limit: 1,
            sort: ['-id'],
        })
        const data = results.data[0]
        if(data) {
            return {
                pages: parseIfNeeded(data.pages),
                fonts: parseIfNeeded(data.fonts),
                publication: parseIfNeeded(data.publication),
                settings: parseIfNeeded(data.settings),
                symbols: parseIfNeeded(data.symbols),
                styles: parseIfNeeded(data.styles),
            }
        } else {
            return null
        }
    } catch (err) {
        console.error(err)
    }
}

// **
// Authentication commands and functions
async function login(editor, directus, options) {
    user = await auth(editor, directus)
    editor.trigger('login:success')
    editor.StorageManager.config.autosave = options.autosave
}
async function logout(editor, directus) {
    user = null
    editor.StorageManager.config.autosave = false
    await directus.auth.logout()
    editor.trigger('logout:success')
}
async function auth(editor, directus) {
    try {
    // Try to authenticate with token if exists
        await directus.auth.refresh()
    } catch(refreshError) {
    // We don't have token or it is invalid / expired
    }
    let me = false
    try {
        me = await directus.users.me.read()
    } catch(userError) {
    // Not authenticated yet
    }
    if(!me) {
        await doLogin(editor, directus)
        me = await directus.users.me.read()
    }
    return me
}

async function doLogin(editor, directus, previousError = null) {
    if(previousError) window.alert(previousError)
    const email = window.prompt('Email:')
    const password = window.prompt('Password:')

    try {
        await directus.auth.login({ email, password })
    } catch(err) {
        console.error('auth error', err.message)
        editor.trigger('auth:error', err.message)
        doLogin(editor, directus, err.message)
    }
}

