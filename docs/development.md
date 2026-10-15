# Development Guide

Everything needed to get the monorepo running, verify a change, and ship it.
For the condensed version aimed at AI agents, see [AGENTS.md](../AGENTS.md).

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 24 | Pinned in [`.nvmrc`](../.nvmrc); use the current LTS release. |
| Yarn | 1.x (classic) | Required — the repo uses Yarn v1 **workspaces**. `packageManager` pins `yarn@1.22.21`. npm will not link the workspaces correctly. |
| Firebase CLI | 15.x (`firebase-tools`) | Only needed for deploying or editing rules/indexes. Installed as a devDependency. |

## First-time setup

```bash
git clone git@github.com:<YOUR_GITHUB_USER>/communitymap-ui.git
cd communitymap-ui

yarn install            # run at the ROOT — never inside a workspace
```

Yarn hoists all dependencies into the root `node_modules/` and symlinks
`node_modules/@opencommunitymap/react-sdk` → `react-sdk/`. That symlink is how the
webapp resolves the SDK.

Create the optional webapp environment file if you need to override Firebase or
enable Cloudinary uploads:

```bash
cd webapp
cp .env.sample .env
```

## Environment variables

All are read by Vite at **build time**. The compatibility layer in
`webapp/vite.config.mjs` intentionally retains the existing `REACT_APP_` names.
They live in `webapp/.env` (git-ignored) locally, and in GitHub Secrets for CI.

| Variable | Required | Purpose |
| --- | --- | --- |
| `REACT_APP_OCM_ENV` | no | Which baked-in Firebase project to use: `production` or `development`. Defaults to `NODE_ENV`, so `yarn start` → dev project, `yarn build` → production project. |
| `REACT_APP_CLOUDINARY_CLOUD_NAME` | no | Enables the logo upload widget on the "Place" form. Without it the field is hidden. |
| `REACT_APP_CLOUDINARY_UPLOAD_PRESET_LOGO` | no | Unsigned Cloudinary upload preset — recommended, to cap image size. |

CI uses the development Firebase project for pull requests, `master`, and `next`;
only the `prod` deployment builds against production.

## The build order that matters

The webapp imports `@opencommunitymap/react-sdk`, whose `main` is
`react-sdk/dist/index.js`. **It never reads `react-sdk/src/`.** So:

```bash
cd react-sdk
yarn build      # rm -rf dist && tsc && sync-glob src/components/*.css -> dist/components/
```

must run before the webapp can see any SDK change. While working on both at once:

```bash
cd react-sdk && yarn watch     # tsc -w plus a CSS watcher, via concurrently
# ...in a second terminal:
cd webapp && yarn start
```

Note that `yarn build` **deletes `dist/` first**. If the TypeScript compile fails,
you are left with no `dist/` at all and the webapp will report that
`@opencommunitymap/react-sdk` cannot be found. Fix the compile error and rebuild;
nothing else is wrong.

From the repo root, `yarn build` runs `yarn workspaces run build`, which builds
`react-sdk` then `webapp` in workspace order.

## Running the webapp

```bash
cd webapp
yarn start        # http://localhost:3000
```

Useful URLs while developing:

| URL | What it shows |
| --- | --- |
| `/` | The map |
| `/object/<objectId>` | Map with that object's modal open |
| `/users/<uid>` | Public profile modal |
| `/my-messages` | Direct-message dialogs |
| `/direct-messages/<dmKey>` | One conversation (`dmKey` = the two uids sorted and joined with `-`) |
| `/terms`, `/privacy` | Legal pages |
| `/embed?appId=Test42` | Embedded mode (see [README](../README.md#embedding-into-3rd-party-site)) |

Embed mode is detected from `window.location.pathname` and mounts the router with
`basename="/embed"`; `appId` is mandatory there and is stored as the `origin` of
every object posted through that embed.

## Verifying a change

There is no unit-test suite in this repo and `react-sdk` has no test script.
The webapp has Playwright Chromium checks for the map, client-side routing,
MUI dialogs, mobile posting controls, and form payloads. The form fixture uses
local callbacks and does not write to Firebase.

Sign-in uses FirebaseUI v7 (`@firebase-oss/ui-react`) with Firebase 11/12 and React
19. Both the SDK and site use the SDK's `Login`; the site supplies its legal links.
The login fixture covers StrictMode, reopening, policy links, simulated popup
cancellation, and shared auth sessions using local Auth HTTP responses, without
writing to Firestore. A manual Google sign-in is still needed to verify a real
account and the deployed OAuth configuration.

See [the FirebaseUI v7 migration](firebaseui-v7-migration.md) for the implementation
contract and verification checklist.

Verify with types, builds, and browser checks:

```bash
cd react-sdk && yarn build                          # strict tsc + noUnusedLocals
cd webapp   && npx tsc --noEmit -p tsconfig.json    # quick typecheck of the app
cd webapp   && yarn build                           # typecheck + Vite production build
yarn test:e2e                                       # from root; uses that build
```

Install Chromium once before the first local smoke run with
`yarn workspace community-map playwright install chromium`. CI installs Chromium
and its system dependencies automatically.

Then exercise the change in the browser — most of this codebase is realtime
Firestore subscriptions and map interaction, which types alone cannot cover:
post an object, comment, vote, close it, and send a direct message.

## Deployment

Deployment is automatic via GitHub Actions
([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)) on push to:

| Branch | Firebase project | |
| --- | --- | --- |
| `master` | `community-map-dev` | explicit alias |
| `next` | `community-map-dev` | via the `default` alias — `next` has no entry of its own |
| `prod` | `communitymap42` | explicit alias |

Mapping lives in [.firebaserc](../.firebaserc), and `firebase-ci` picks the alias
matching the branch name. The workflow authenticates with the `FIREBASE_TOKEN`
secret; `firebase-tools` marks that flow deprecated in favour of a service
account (`GOOGLE_APPLICATION_CREDENTIALS`), so plan to switch before the next
major CLI release. Manual deployment, if you have access:

```bash
cd webapp
yarn deploy                # build + firebase deploy (everything)
yarn deploy_hosting        # build + hosting only
```

Firestore rules and indexes are deployed from the repo root
([firebase.json](../firebase.json) points at [firestore.rules](../firestore.rules)
and [firestore.indexes.json](../firestore.indexes.json)). After changing indexes in
the Firebase console, sync them back with:

```bash
cd webapp && yarn index_sync
```

Hosting also rewrites `/api/v0/object/**` and `/hello/**` to Cloud Functions that
live in the separate `communitymap-cloud-functions` repo, and everything else to
`index.html` for client-side routing.

## Self-hosting with a different Firebase project

1. `firebase init` and select your project.
2. Put your web app config into `react-sdk/src/utils/.fb-conf-dev.js` and
   `.fb-conf-prod.js` (both `export default { … }`). These are **hidden dotfiles**
   and are the configs the SDK actually uses.
3. Deploy [firestore.rules](../firestore.rules) and
   [firestore.indexes.json](../firestore.indexes.json) to it.
4. Alternatively, pass a config object straight to `initFirebase({ … })` from your
   own host application instead of editing the SDK.

`webapp/src/firebaseConfig.ts` is a leftover from the earlier setup and is not used
by the app — the code that imported it is commented out in `webapp/src/App.tsx`.

## Troubleshooting

**`Cannot find module '@opencommunitymap/react-sdk'`**
The SDK's `dist/` is missing (failed/interrupted build) or the workspace symlink is
absent. Run `cd react-sdk && yarn build`; if that is not enough, `yarn install` at
the root.

**`Cannot find module '../lib/tsc.js'` when running `yarn build`**
The `node_modules/.bin` shims are broken — typical of a `node_modules` restored from
a backup or created by a different package manager. Re-run `yarn install` at the
root. As a one-off workaround the compiler can be invoked directly:
`node ../node_modules/typescript/bin/tsc`.

**`Something is already running on port 3000.`**
Choose a different Vite port: `yarn start --port 3099`.

**Map is blank / grey**
Check that the browser supports WebGL and can reach `tiles.openfreemap.org`. Also
check the container has a size — the map fills its parent, and in development the
SDK renders an explicit warning when the parent collapses to zero height.

**Objects do not appear**
Objects are filtered by `valid_until >= now`, so expired ones vanish. Also confirm
you are pointed at the Firebase project you expect (`REACT_APP_OCM_ENV`) — the
default is production whenever nothing calls `initFirebase` first.

**Comments/votes missing on some pins**
Expected: only the first 10 objects in view get them (Firestore `in` limit). See
[AGENTS.md](../AGENTS.md#known-limitations-already-in-the-code--dont-fix-by-accident).
