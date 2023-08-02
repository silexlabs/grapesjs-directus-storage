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
import { Directus } from '@directus/sdk';
// Store the user temporarily
var _user = null;
/**
 * Define the plugin
 * @param opts.collection: name of the directus collection to hold silex website data
 * @param opts.assets: the path to directus assets folder
 */
export default (function (editor, opts) {
    // Default config
    var className = opts.className || 'directus__login';
    var selector = className.split(' ').join('.');
    var options = __assign({ collection: 'silex', assets: '/assets', className: className, userUpdated: true, userCreated: true, styles: "\n        form.".concat(selector, " {\n            display: flex;\n            flex-direction: column;\n        }\n        form.").concat(selector, " input {\n            color: white;\n            background: black;\n            border: none;\n            padding: 5px;\n            display: block;\n        }\n        form.").concat(selector, " input[type=\"submit\"] {\n            margin-left: auto;\n        }\n        form.").concat(selector, " input:not([type=\"submit\"]) {\n            margin-top: 10px;\n            margin-bottom: 10px;\n        }\n        form.").concat(selector, " .error {\n            text-align: center;\n            margin: 0;\n            margin-top: 10px;\n        }\n        .small-modal > div {\n            max-width: 300px;\n        }\n      ") }, opts);
    if (!options.directusUrl) {
        throw new Error('Option `directusUrl` is required');
    }
    // Create directus client
    var directus = new Directus(options.directusUrl);
    // Grapesjs custom storage to use directus collection to store the website data
    editor.Storage.add('directus', {
        store: function (data) { return store(editor, directus, options, data); },
        load: function () { return load(editor, directus, options); },
    });
    // Commands
    editor.Commands.add('login', function () { return login(editor, directus, options); });
    editor.Commands.add('logout', function () { return logout(editor, directus); });
    editor.Commands.add('relogin', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, logout(editor, directus)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, login(editor, directus, options)];
            }
        });
    }); });
    // Custom asset manager to upload assets to directus
    // from grapesjs asset manager UI
    editor.AssetManager.config.uploadFile = uploadFile(editor, directus, options);
    editor.on('asset:open', function () { return loadAssets(editor, directus, options); });
    // Prevent undo loaded data
    // Prevent save on load
    // FIXME: this is hacky, why do we need this and why the setTimeout is needed
    var autosave = editor.StorageManager.config.autosave;
    editor.on('storage:start:load', function () {
        editor.StorageManager.setAutosave(false);
    });
    editor.on('storage:end:load', function () {
        setTimeout(function () {
            editor.UndoManager.clear();
            editor.StorageManager.setAutosave(autosave);
        }, 500);
    });
    // Load content when loggedin
    editor.once('login:success', function () {
        editor.load();
    });
    // Login immediately
    editor.runCommand('login');
});
// **
// AssetManager functions
function loadAssets(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, directus.files.readByQuery({
                        limit: -1,
                        sort: ['-uploaded_on'],
                    })];
                case 1:
                    data = (_a.sent()).data;
                    data.forEach(function (image) { return editor.AssetManager.add(__assign(__assign({}, image), { src: "".concat(options.directusUrl).concat(options.assets, "/").concat(image.filename_disk) })); });
                    return [2 /*return*/];
            }
        });
    });
}
function uploadFile(editor, directus, options) {
    return function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var files, formData, i, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
                        formData = new FormData();
                        for (i in files) {
                            formData.append('file-' + i, files[i]);
                        }
                        return [4 /*yield*/, directus.files.createOne(formData)
                            // When uploading 1 asset only, results is an object instead of array
                            // Make it an array in any case
                        ];
                    case 1:
                        results = _a.sent();
                        [].concat(results)
                            .forEach(function (image) {
                            // Keep only the necessary fields
                            // Store the image info in grapesjs data structure
                            editor.AssetManager.add(__assign(__assign({}, image), { src: "".concat(options.directusUrl).concat(options.assets, "/").concat(image.filename_disk) }));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
}
// **
// Storage functions
function store(editor, directus, options, data) {
    return __awaiter(this, void 0, void 0, function () {
        var assets, saved, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 4]);
                    assets = data.assets, saved = __rest(data, ["assets"]);
                    return [4 /*yield*/, directus.items(options.collection).createOne(__assign(__assign(__assign(__assign(__assign({}, saved), (options.userUpdated && { user_updated: _user === null || _user === void 0 ? void 0 : _user.id })), (options.userUpdated && { date_updated: new Date() })), (options.userCreated && { user_created: _user === null || _user === void 0 ? void 0 : _user.id })), (options.userCreated && { date_created: new Date() })))];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
                case 2:
                    err_1 = _a.sent();
                    return [4 /*yield*/, reloginOnError(editor, directus, options, err_1)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, store(editor, directus, options, data)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function parseIfNeeded(strOrElse) {
    return typeof strOrElse == 'string' ? JSON.parse(strOrElse) : strOrElse;
}
function load(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function () {
        var results, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 4]);
                    return [4 /*yield*/, directus.items(options.collection).readByQuery({
                            limit: 1,
                            sort: ['-id'],
                        })];
                case 1:
                    results = _a.sent();
                    data = results.data[0];
                    if (data) {
                        return [2 /*return*/, {
                                pages: parseIfNeeded(data.pages),
                                fonts: parseIfNeeded(data.fonts),
                                publication: parseIfNeeded(data.publication),
                                settings: parseIfNeeded(data.settings),
                                symbols: parseIfNeeded(data.symbols),
                                styles: parseIfNeeded(data.styles),
                            }];
                    }
                    else {
                        return [2 /*return*/, null];
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    return [4 /*yield*/, reloginOnError(editor, directus, options, err_2)];
                case 3:
                    _a.sent();
                    return [2 /*return*/, load(editor, directus, options)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function reloginOnError(editor, directus, options, err) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) {
                case 401:
                case 403:
                    editor.trigger('logout:success');
                    return [2 /*return*/, login(editor, directus, options)];
                default:
                    throw err;
            }
            return [2 /*return*/];
        });
    });
}
// **
// Authentication commands and functions
function login(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    editor.trigger('login:start');
                    return [4 /*yield*/, auth(editor, directus, options)];
                case 1:
                    _user = _a.sent();
                    editor.trigger('login:success', {
                        getToken: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, directus.auth.token];
                        }); }); },
                        // Give access to the current user (data from directus)
                        getUser: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, auth(editor, directus, options)];
                        }); }); },
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function logout(editor, directus) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _user = null;
                    return [4 /*yield*/, directus.auth.logout()];
                case 1:
                    _a.sent();
                    editor.trigger('logout:success');
                    return [2 /*return*/];
            }
        });
    });
}
function auth(editor, directus, options) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshError_1, me, userError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Try to authenticate with token if exists
                    return [4 /*yield*/, directus.auth.refresh()];
                case 1:
                    // Try to authenticate with token if exists
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    refreshError_1 = _a.sent();
                    return [3 /*break*/, 3];
                case 3:
                    me = false;
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, directus.users.me.read()];
                case 5:
                    me = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    userError_1 = _a.sent();
                    return [3 /*break*/, 7];
                case 7:
                    if (!!me) return [3 /*break*/, 10];
                    return [4 /*yield*/, doLogin(editor, directus, options)];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, directus.users.me.read()];
                case 9:
                    me = _a.sent();
                    _a.label = 10;
                case 10: return [2 /*return*/, me];
            }
        });
    });
}
function doLogin(editor, directus, options, previousError) {
    if (previousError === void 0) { previousError = null; }
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var el = document.createElement('div');
                    el.innerHTML = "\n            <form class=\"".concat(options.className, "\">\n              <style>\n                ").concat(options.styles, "\n              </style>\n              <input id=\"pseudo\" type=\"email\" placeholder=\"User\" required>\n              <input id=\"pass\" type=\"password\" placeholder=\"Password\" required>\n              <input id=\"submit\" type=\"submit\" value=\"Login\">\n              <p class=\"error\">").concat(previousError || '', "</p>\n            </form>\n        ");
                    var form = el.firstElementChild;
                    var pseudo = el.querySelector('input#pseudo');
                    var pass = el.querySelector('input#pass');
                    editor.Modal.open({
                        title: 'Login to Directus',
                        content: el,
                        attributes: {
                            class: 'small-modal',
                        },
                    });
                    pseudo.focus();
                    form.onsubmit = function (event) {
                        event.preventDefault();
                        editor.Modal.close();
                    };
                    editor.Modal.onceClose(function () { return __awaiter(_this, void 0, void 0, function () {
                        var email, password;
                        return __generator(this, function (_a) {
                            email = pseudo.value;
                            password = pass.value;
                            directus.auth.login({ email: email, password: password })
                                .then(function () { return resolve(); })
                                .catch(function (err) {
                                editor.trigger('login:error', err);
                                resolve(doLogin(editor, directus, options, err.message));
                            });
                            return [2 /*return*/];
                        });
                    }); });
                })];
        });
    });
}
