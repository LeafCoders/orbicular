# Orbiculer

Slide show presenter.

## Features

- Show slides from a slide show.
- Automatic adds new slides and removes old slides.
- Optional PWA support (manifest, offline, cache).

## Development

Start web server with auto compile with `npm start`.

## Production

Follow these instructions to build and configure for prouction:

### Build

1) Run `npm run build` to compile and bundle the application.
1) The build output will been created in `/build/prod-es6`.
1) Use the files `index.html`, `orbicular-app.js`, `manifest.json` and `service-worker.js`.
1) Ignore the files in `/build/prod-es6/src`, they are not used in production.

### Build with filename prefix

If you want to serve multiple slide shows from the same folder you may build the files with
a prefix. Modify `package.json` by replacing all `name` occurenses with your own prefix.
Then run `npm run build:name`.

### Enable offline mode with service worker

1) The service worker is loaded from the `index.html` file.
1) The file `service-worker.js` does the offline caching.
1) Replace `__rosetteBaseUrl__` in the last line of the file with the url to your Rosette server.
Important! The url must be written in RegEx format, eg. `https:\/\/rosette.domain.com`.

### Enable manifest for PWA

1) The manifest is specified in the `index.html` file.
1) The file `manifest.json` adds the PWA support.
1) The values `start_url` and `scope` in `manifest.json` must both be the url where the application is served.
Eg. `https://domain.com/some/path/` (last `/` is important)
1) The element `<base href="/">` in `index.html` must be the subpath.
Eg. `/some/path/` (last `/` is important)
1) `polymer.json` specifies `"shell": "orbicular-app.js"`. That prevents the application from
running at localhost. Will give the error `Access to script at 'file:///orbicular-app.js' from origin 'null' has been blocked by CORS policy`.
To test at localhost you must remove the `shell` property.

### Configuration

The `index.html` has an element `<orbicular-app>`. It contains the following attributes:

- `rosette-base-url` - url to Rosette Server
- `slide-show-id-alias` - aliasId of the slide show to show slides from
- `show-indicator` - shows active slide indicator at the bottom of the screen

Change them to configure the application.