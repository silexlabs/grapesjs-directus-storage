import grapesjs from 'grapesjs/dist/grapes.min.js'
import { Directus } from '@directus/sdk'

// Store the user temporarily
let _user = null
let _isSingleton = false

/**
 * Define the plugin
 * @param opts.collection: name of the directus collection to hold silex website data
 * @param opts.assets: the path to directus assets folder
 */
export default grapesjs.plugins.add('@silexlabs/grapesjs-directus-storage', (editor, opts) => {
    // Default config
    const className = opts.className || 'directus__login'
    const selector = className.split(' ').join('.')
    const options = {
        collection: 'silex',
        assets: '/assets',
        className,
        styles: `
        form.${selector} {
            display: flex;
            flex-direction: column;
        }
        form.${selector} input {
            color: white;
            background: black;
            border: none;
            padding: 5px;
            display: block;
        }
        form.${selector} input[type="submit"] {
            margin-left: auto;
        }
        form.${selector} input:not([type="submit"]) {
            margin-top: 10px;
            margin-bottom: 10px;
        }
        form.${selector} .error {
            text-align: center;
            margin: 0;
            margin-top: 10px;
        }
        .small-modal > div {
            max-width: 300px;
        }
      `,
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
    editor.Commands.add('relogin', async () => {
        await logout(editor, directus)
        return login(editor, directus, options)
    })

    // Custom asset manager to upload assets to directus
    // from grapesjs asset manager UI
    editor.AssetManager.config.uploadFile = uploadFile(editor, directus, options)
    editor.on('asset:open', () => loadAssets(editor, directus, options))

    // Load content when loggedin
    editor.once('login:success', () => editor.load(() => editor.getModel().set('changesCount', 0)))

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
        const result = await directus.items(options.collection)[_isSingleton ? 'update' : 'createOne']({
            ...saved,
            user_updated: _user?.id,
            date_updated: new Date(),
        })
        return result
    } catch (err) {
        await reloginOnError(editor, directus, options, err)
        return store(editor, directus, options, data)
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
        _isSingleton = Array.isArray(results.data)
        const data = _isSingleton ? results.data[0] : results.data
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
        await reloginOnError(editor, directus, options, err)
        return load(editor, directus, options)
    }
}
async function reloginOnError(editor, directus, options, err) {
    switch(err.response?.status) {
    case 401:
    case 403:
        editor.trigger('logout:success')
        return login(editor, directus, options)
    default:
        throw err
    }
}

// **
// Authentication commands and functions
async function login(editor, directus, options) {
    editor.trigger('login:start')
    _user = await auth(editor, directus, options)
    editor.trigger('login:success', {
        getToken: async () => directus.auth.token,
        // Give access to the current user (data from directus)
        getUser: async () => auth(editor, directus, options),
    })
    editor.StorageManager.config.autosave = options.autosave
}
async function logout(editor, directus) {
    _user = null
    editor.StorageManager.config.autosave = false
    await directus.auth.logout()
    editor.trigger('logout:success')
}
async function auth(editor, directus, options) {
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
        await doLogin(editor, directus, options)
        me = await directus.users.me.read()
    }
    return me
}

async function doLogin(editor, directus, options, previousError = null) {
    return new Promise(resolve => {
        const el = document.createElement('div')
        el.innerHTML = `
            <form class="${options.className}">
              <style>
                ${options.styles}
              </style>
              <input id="pseudo" type="email" placeholder="User" required>
              <input id="pass" type="password" placeholder="Password" required>
              <input id="submit" type="submit" value="Login">
              <p class="error">${previousError || ''}</p>
            </form>
        `
        const form = el.firstElementChild
        const pseudo = el.querySelector('input#pseudo')
        const pass = el.querySelector('input#pass')
        editor.Modal.open({
            title: 'Login to Directus',
            content: el,
            attributes: {
                class: 'small-modal',
            },

        })
        pseudo.focus()
        form.onsubmit = event => {
            event.preventDefault()
            editor.Modal.close()
        }

        editor.Modal.onceClose(async () => {
            const email = pseudo.value
            const password = pass.value

            directus.auth.login({ email, password })
                .then(() => resolve())
                .catch(err => {
                    editor.trigger('login:error', err)
                    resolve(doLogin(editor, directus, options, err.message))
                })
        })
    })
}

