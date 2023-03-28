# Grapesjs Directus Storage

Directus as a backend for GrapesJS

> This code is part of a bigger project: [about Silex v3](https://www.silexlabs.org/silex-v3-kickoff/)

Links

* [DEMO on Codepen](https://codepen.io/lexoyo/full/RwYdGGO)
* [Npm package](https://www.npmjs.com/package/@silexlabs/grapesjs-directus-storage)

The plugin currently has these features

* Authentication commands using Directus API to login/logout the user
* Custom StorageManager to store the website data in a Directus collection
* Custom AssetManager which integrates with Directus assets
* This plugin provides easy versioning of the website data and assets
* The JSON data of the website and the assets are readable and editable in Directus
* Directus provides no-code flow automations

### HTML
```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet">
<script src="https://unpkg.com/grapesjs"></script>
<script src="https://unpkg.com/@silexlabs/grapesjs-directus-storage"></script>

<div id="gjs"></div>
```

### JS
```js
const editor = grapesjs.init({
  container: '#gjs',
  height: '100%',
  fromElement: true,
  storageManager: {
    type: 'directus',
    autoload: false,
  },
  plugins: ['@silexlabs/grapesjs-directus-storage'],
  pluginsOpts: {
    '@silexlabs/grapesjs-directus-storage': {
      directusUrl: prompt('You need a Directus server to test this plugin. Directus server URL', 'http://localhost:8055')
    }
  }
});
```

### CSS
```css
body, html {
  margin: 0;
  height: 100%;
}
```

## Directus settings

On the Directus side, you need

1. A collection to store your website data
1. A user with access right to the collection and the collection `directus_files`

The collection to store your data needs to have these fields

* `pages`
* `styles`
* `fonts` (optional, for use with @silexlabs/grapesjs-fonts)
* `symbols` (optional, for use with @silexlabs/grapesjs-symbols)

These fields can be of `code` fields of type JSON so that the UI is adequat, or they can be simple text fields

As the plugin needs to connect to your Directus server, you need to handle CORS on the server, [read Directus docs on CORS](https://docs.directus.io/self-hosted/config-options.html#cors)

## Options

| Option | Description | Default |
|-|-|-
| `directusUrl` | Directus URL | Required |
| `collection` | Name of the directus collection to hold silex website data | `silex` |
| `assets` | Path to directus assets folder, relative to the server root | `/assets` |

## Download

* CDN
  * `https://unpkg.com/@silexlabs/grapesjs-directus-storage`
* NPM
  * `npm i @silexlabs/grapesjs-directus-storage`
* GIT
  * `git clone https://github.com/silexlabs/grapesjs-directus-storage.git`

## Usage

Directly in the browser
```html
<link href="https://unpkg.com/grapesjs/dist/css/grapes.min.css" rel="stylesheet"/>
<script src="https://unpkg.com/grapesjs"></script>
<script src="path/to/grapesjs-directus-storage.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container: '#gjs',
      // ...
      plugins: ['grapesjs-directus-storage'],
      pluginsOpts: {
        'grapesjs-directus-storage': { /* options */ }
      }
  });
</script>
```

Modern javascript
```js
import grapesjs from 'grapesjs';
import plugin from '@silexlabs/grapesjs-directus-storage';
import 'grapesjs/dist/css/grapes.min.css';

const editor = grapesjs.init({
  container : '#gjs',
  // ...
  plugins: [plugin],
  pluginsOpts: {
    [plugin]: { /* options */ }
  }
  // or
  plugins: [
    editor => plugin(editor, { /* options */ }),
  ],
});
```



## Development

Clone the repository

```sh
$ git clone https://github.com/silexlabs/grapesjs-directus-storage.git
$ cd grapesjs-directus-storage
```

Install dependencies

```sh
$ npm i
```

Start the dev server

```sh
$ npm start
```

Build the source

```sh
$ npm run build
```

## License

MIT
