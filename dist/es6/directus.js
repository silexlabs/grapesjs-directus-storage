var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Directus } from '/js/directus/sdk.esm.min.js';
// Store the user temporarily
let _user = null;
/**
 * Define the plugin
 * @param opts.collection: name of the directus collection to hold silex website data
 * @param opts.assets: the path to directus assets folder
 */
export default (editor, opts) => {
    // Default config
    const className = opts.className || 'directus__login';
    const selector = className.split(' ').join('.');
    const options = Object.assign({ collection: 'silex', assets: '/assets', className, userUpdated: true, userCreated: true, styles: `
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
      ` }, opts);
    if (!options.directusUrl) {
        throw new Error('Option `directusUrl` is required');
    }
    // Create directus client
    const directus = new Directus(options.directusUrl);
    // Grapesjs custom storage to use directus collection to store the website data
    editor.Storage.add('directus', {
        store: (data) => store(editor, directus, options, data),
        load: () => load(editor, directus, options),
    });
    // Commands
    editor.Commands.add('login', () => login(editor, directus, options));
    editor.Commands.add('logout', () => logout(editor, directus));
    editor.Commands.add('relogin', () => __awaiter(void 0, void 0, void 0, function* () {
        yield logout(editor, directus);
        return login(editor, directus, options);
    }));
    // Custom asset manager to upload assets to directus
    // from grapesjs asset manager UI
    editor.AssetManager.config.uploadFile = uploadFile(editor, directus, options);
    editor.on('asset:open', () => loadAssets(editor, directus, options));
    // Prevent undo loaded data
    // Prevent save on load
    // FIXME: this is hacky, why do we need this and why the setTimeout is needed
    const { autosave } = editor.StorageManager.config;
    editor.on('storage:start:load', () => {
        editor.StorageManager.setAutosave(false);
    });
    editor.on('storage:end:load', () => {
        setTimeout(() => {
            editor.UndoManager.clear();
            editor.StorageManager.setAutosave(autosave);
        }, 500);
    });
    // Load content when loggedin
    editor.once('login:success', () => {
        editor.load();
    });
    // Login immediately
    editor.runCommand('login');
};
// **
// AssetManager functions
function loadAssets(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield directus.files.readByQuery({
            limit: -1,
            sort: ['-uploaded_on'],
        });
        data.forEach(image => editor.AssetManager.add(Object.assign(Object.assign({}, image), { src: `${options.directusUrl}${options.assets}/${image.filename_disk}` })));
    });
}
function uploadFile(editor, directus, options) {
    return function (e) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
            const formData = new FormData();
            for (const i in files) {
                formData.append('file-' + i, files[i]);
            }
            const results = yield directus.files.createOne(formData);
            [].concat(results)
                .forEach(image => {
                // Keep only the necessary fields
                // Store the image info in grapesjs data structure
                editor.AssetManager.add(Object.assign(Object.assign({}, image), { src: `${options.directusUrl}${options.assets}/${image.filename_disk}` }));
            });
        });
    };
}
// **
// Storage functions
function store(editor, directus, options, data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            /* eslint-disable-next-line no-unused-vars */
            const { assets } = data, saved = __rest(data, ["assets"]);
            const result = yield directus.items(options.collection).createOne(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, saved), (options.userUpdated && { user_updated: _user === null || _user === void 0 ? void 0 : _user.id })), (options.userUpdated && { date_updated: new Date() })), (options.userCreated && { user_created: _user === null || _user === void 0 ? void 0 : _user.id })), (options.userCreated && { date_created: new Date() })));
            return result;
        }
        catch (err) {
            yield reloginOnError(editor, directus, options, err);
            return store(editor, directus, options, data);
        }
    });
}
function parseIfNeeded(strOrElse) {
    return typeof strOrElse == 'string' ? JSON.parse(strOrElse) : strOrElse;
}
function load(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield directus.items(options.collection).readByQuery({
                limit: 1,
                sort: ['-id'],
            });
            const data = results.data[0];
            if (data) {
                return {
                    pages: parseIfNeeded(data.pages),
                    fonts: parseIfNeeded(data.fonts),
                    publication: parseIfNeeded(data.publication),
                    settings: parseIfNeeded(data.settings),
                    symbols: parseIfNeeded(data.symbols),
                    styles: parseIfNeeded(data.styles),
                };
            }
            else {
                return null;
            }
        }
        catch (err) {
            yield reloginOnError(editor, directus, options, err);
            return load(editor, directus, options);
        }
    });
}
function reloginOnError(editor, directus, options, err) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        switch ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) {
            case 401:
            case 403:
                editor.trigger('logout:success');
                return login(editor, directus, options);
            default:
                throw err;
        }
    });
}
// **
// Authentication commands and functions
function login(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function* () {
        editor.trigger('login:start');
        _user = yield auth(editor, directus, options);
        editor.trigger('login:success', {
            getToken: () => __awaiter(this, void 0, void 0, function* () { return directus.auth.token; }),
            // Give access to the current user (data from directus)
            getUser: () => __awaiter(this, void 0, void 0, function* () { return auth(editor, directus, options); }),
        });
    });
}
function logout(editor, directus) {
    return __awaiter(this, void 0, void 0, function* () {
        _user = null;
        yield directus.auth.logout();
        editor.trigger('logout:success');
    });
}
function auth(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function* () {
        //try {
        //    // Try to authenticate with token if exists
        //    await directus.auth.refresh()
        //} catch(refreshError) {
        //    // We don't have token or it is invalid / expired
        //}
        let me = false;
        try {
            me = yield directus.users.me.read();
        }
        catch (userError) {
            // Not authenticated yet
        }
        if (!me) {
            yield doLogin(editor, directus, options);
            me = yield directus.users.me.read();
        }
        return me;
    });
}
function doLogin(editor, directus, options, previousError = null) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const el = document.createElement('div');
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
        `;
            const form = el.firstElementChild;
            const pseudo = el.querySelector('input#pseudo');
            const pass = el.querySelector('input#pass');
            editor.Modal.open({
                title: 'Login to Directus',
                content: el,
                attributes: {
                    class: 'small-modal',
                },
            });
            pseudo.focus();
            form.onsubmit = event => {
                event.preventDefault();
                editor.Modal.close();
            };
            editor.Modal.onceClose(() => __awaiter(this, void 0, void 0, function* () {
                const email = pseudo.value;
                const password = pass.value;
                directus.auth.login({ email, password })
                    .then(() => resolve())
                    .catch(err => {
                    editor.trigger('login:error', err);
                    resolve(doLogin(editor, directus, options, err.message));
                });
            }));
        });
    });
}
