# Ahil Planner

A responsive, account-free task planner built with React and Vite.

## Run locally

Requires Node.js 20.19+ or 22.12+ (Node 24 verified).

```sh
npm ci --cache /tmp/ahil-npm-cache
npm run dev
```

Vite uses port 5173 by default. The terminal reports the actual port.

## Verify and build

```sh
npm test
npm run build
npm run preview
```

The production site is generated in `dist/`. Serve it with a static web host.

## Use

Add a task with an optional deadline. Select its star to choose up to three priorities. Edit task names and deadlines, complete or reopen tasks using their checkbox, and switch between Active and Completed. Completing a priority frees its focus slot. Delete removes a task immediately.

Tasks save automatically in this browser's localStorage. They do not sync between devices, browsers, or site addresses. Clearing site data removes tasks. If storage is unavailable, the app warns you; current tasks remain usable until the page closes. Avoid using this as the only copy of important information.

No server, account, API keys, or external fonts are required.

If unreadable stored data is found, the original is retained until a new list is created; a recovery copy is then kept under `ahil-planner-v1-recovery`. If another tab changes the saved list, this tab warns and stops saving over that list: copy any new work before reloading.

## Try without installing or hosting

Open `release/ahil-planner.html` in a modern browser. The file includes all application assets and needs no server or hosting account. To rebuild it, run `npm run package:standalone` after installing dependencies.

Use the same file location and browser each time. Browser storage for local files varies by browser; the app warns if it cannot save. Moving the file can make previously saved tasks unavailable. This version does not sync with the hosted or development version.

Validation: the standalone document was tested through a local HTTP server in Chromium, including reload persistence and no external requests. This managed Chromium blocks `file://` navigation by administrator policy, so opening the file directly could not be verified here.

## GitHub Pages deployment

The `ahil-planner` branch contains the source. The `gh-pages` branch contains the production site, built with `npm run build -- --base=/Ahil/` for this repository's URL path.

To activate hosting, open this repository's Settings → Pages, choose **Deploy from a branch**, select **gh-pages**, select **/ (root)**, and save. GitHub must confirm deployment before the site can be considered live. Repository visibility and GitHub plan may affect Pages availability.
