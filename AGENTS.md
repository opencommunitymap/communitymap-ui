# AGENTS.md

Guide for AI coding agents working in this repository. Read this first, then the
linked docs in [docs/](docs/) as needed.

## What this project is

**Open Community Map** — a map where people post location-bound items ("objects"):
chats, help requests, offers, donations, places and stories. Other people can
comment, up-vote and direct-message each other.

It is a **frontend-only** repo. All persistence, auth and realtime updates go
directly to **Firebase** (Firestore + Firebase Auth) from the browser. There is no
backend in this repository — the HTTP API and API keys live in the separate
[communitymap-cloud-functions](https://github.com/opencommunitymap/communitymap-cloud-functions)
repo.

## Repository layout

Yarn v1 **workspaces monorepo** (`react-sdk` + `webapp`, declared in the root
[package.json](package.json)):

| Path | What it is |
| --- | --- |
| [react-sdk/](react-sdk/) | `@opencommunitymap/react-sdk` — the publishable library. All map, data and UI logic lives here. |
| [webapp/](webapp/) | `community-map` — the Vite site (communitymap.online), a thin shell around the SDK. |
| [docs/](docs/) | Architecture, data model and SDK API reference. |
| [examples/](examples/) | `embed/` — iframe embedding example. |
| [firestore.rules](firestore.rules), [firestore.indexes.json](firestore.indexes.json) | Firestore security rules and composite indexes (deployed from here). |
| [.github/workflows/](.github/workflows/) | CI: `verify.yml` (build on PR), `deploy.yml` (build + Firebase deploy on push). |

**The webapp consumes the SDK from `react-sdk/dist/`, not from its source.**
This is the single most important fact about the build — see below.

## Setup and commands

```bash
yarn install                 # root only — workspaces hoist to root node_modules

cd react-sdk && yarn build   # MUST run before/after touching SDK source
cd react-sdk && yarn watch   # tsc -w + CSS sync, for iterative work

cd webapp && yarn start      # dev server on :3000
cd webapp && yarn build      # production bundle into webapp/build/

yarn build                   # from root: builds both workspaces in order
yarn test:e2e                # Playwright Chromium smoke test; build first
```

Full setup, environment variables and troubleshooting: [docs/development.md](docs/development.md).

### How to verify a change

There is no unit-test suite and `react-sdk` has no test script. The webapp has a
small Playwright Chromium smoke test.

Verify with the type checker and the build instead:

```bash
cd react-sdk && yarn build                    # tsc, strict + noUnusedLocals
cd webapp   && npx tsc --noEmit -p tsconfig.json   # fast typecheck, no bundling
cd webapp   && yarn build                     # typecheck + full Vite build (what CI runs)
yarn test:e2e                                # requires the production build
```

CI ([.github/workflows/verify.yml](.github/workflows/verify.yml)) runs the frozen
install, root build, and Playwright smoke test.

## Traps that will bite you

1. **`react-sdk`'s build script starts with `rm -rf dist`.** A failed or
   interrupted build leaves no `dist/`, and the webapp then cannot resolve
   `@opencommunitymap/react-sdk` at all. If the webapp suddenly cannot find the
   package, rebuild the SDK — the source is fine.
2. **Editing SDK source has no effect on the webapp until the SDK is rebuilt.**
   Run `yarn watch` in `react-sdk` while working across both workspaces.
3. **The real Firebase configs are hidden dotfiles**:
   [react-sdk/src/utils/.fb-conf-dev.js](react-sdk/src/utils/.fb-conf-dev.js) and
   `.fb-conf-prod.js`. They are committed, and `ls`/most glob patterns skip them.
   `webapp/src/firebaseConfig.ts` also exists but is **dead** — the code path that
   used it is commented out in [webapp/src/App.tsx](webapp/src/App.tsx#L43-L55).
4. **Firebase is a *named* app**, `__open_community_map__`. `firebase.app()` with
   no name will not find it — always go through `getFirebaseApp()` from the SDK.
   It lazily calls `initFirebase()` with the **production** config if nothing
   initialised it first, so a missing `initFirebase(env)` silently talks to prod.
5. **`node_modules` in a long-lived checkout may be stale.** Two symptoms seen here:
   broken `.bin` shims (`Cannot find module '../lib/tsc.js'`) and a missing
   `node_modules/@opencommunitymap/react-sdk` workspace symlink, which makes *every*
   webapp file fail to resolve the SDK. Run `yarn install` at the root before
   concluding that something is wrong with the code.
6. **The Vite compatibility settings are deliberate.**
   [webapp/vite.config.mjs](webapp/vite.config.mjs) preserves the legacy
   `REACT_APP_` variables and `webapp/build/` output path. Keep these compatibility settings when updating Vite.
7. **MapLibre GL JS is pinned to v5 deliberately.** V6 requires every bundler
   consuming the published SDK to configure its worker URL and drops WebGL 1.
   Revisit that major separately instead of allowing it through casually.
8. **Never commit** `webapp/.env`, `react-sdk/dist/`, or Cloudinary keys.
   `.env` and `dist/` are already git-ignored; keep it that way.

## Code conventions

- **TypeScript, strict.** `react-sdk` additionally enables `noUnusedLocals`, so an
  unused import fails the build.
- **Function components** with `React.FC<Props>`, hooks only — no classes.
- **Named exports**, re-exported through barrels: SDK via
  [react-sdk/src/index.ts](react-sdk/src/index.ts), webapp via
  [webapp/src/components/index.tsx](webapp/src/components/index.tsx).
  *A new SDK component is not public until it is added to `src/index.ts`.*
- **Shared types live in `react-sdk/src/index.ts` itself**, and modules import them
  back from the package root — `import { ObjectItem } from '..'`. Unusual, but it is
  the established pattern; follow it rather than adding a separate `types.ts`.
- **One CSS file per component**, imported by that component (`import './Story.css'`).
  `commonStyles.css` holds shared bits. `sync-glob` copies CSS into `dist/` at build —
  a new CSS file needs no config change, but it *does* need a rebuild.
- **UI kit is MUI 9 (`@mui/material`) with Emotion**; dates via `dayjs`; class names via `classnames` (`cx`).
- **Timestamps are ISO strings** (`new Date().toISOString()`), never Firestore
  `Timestamp`. Locations are Firestore `GeoPoint` on write, `{latitude, longitude}`
  (`Loc`) in app code.
- **Formatting: Prettier** ([.prettierrc](.prettierrc)) — single quotes, 80 columns,
  2 spaces, semicolons, `es5` trailing commas. There is no lint step in CI; match the
  surrounding file.
- **Commits: Conventional Commits** with a scope, as in the existing history:
  `feat(react-sdk): ...`, `fix(webapp): ...`, `chore(deps): ...`, `docs(main): ...`.
- **Branch + PR into `master`.** Pushes to `master` and `next` deploy to the dev
  Firebase project, `prod` deploys to production ([.firebaserc](.firebaserc) —
  `next` is unmapped and falls through to the `default` alias).

## Where to make a change

| Task | Where |
| --- | --- |
| Map behaviour, object rendering, data loading | [react-sdk/src/modules/](react-sdk/src/modules/) |
| Reusable object/UI widget | [react-sdk/src/components/](react-sdk/src/components/) + export from `src/index.ts` |
| Firestore read/write, hooks | [react-sdk/src/modules/DB.tsx](react-sdk/src/modules/DB.tsx) |
| Auth context | [react-sdk/src/modules/Auth.tsx](react-sdk/src/modules/Auth.tsx) |
| Routing, modals, site-only pages (terms, privacy, DMs, profile) | [webapp/src/](webapp/src/) |
| New object `type` | `ObjectItemInput['type']` in `src/index.ts`, `defaultObjectRender` in [CommunityMap.tsx](react-sdk/src/modules/CommunityMap.tsx), an `AddNew*Object` form, and the buttons in [NewContentWidget.tsx](webapp/src/components/NewContentWidget.tsx) |
| Firestore permissions / indexes | [firestore.rules](firestore.rules), [firestore.indexes.json](firestore.indexes.json) |

Changing the SDK's public API also means: bump `version` in
[react-sdk/package.json](react-sdk/package.json) and add an entry to
[react-sdk/CHANGELOG.md](react-sdk/CHANGELOG.md) (current: `0.1.0-rc9`).

## Known limitations (already in the code — don't "fix" by accident)

- **Comments and votes load for only the first 10 objects** on screen —
  Firestore's `in` operator caps at 10 values ([DB.tsx](react-sdk/src/modules/DB.tsx#L81),
  marked `TODO fix!!`). Objects beyond that show zero comments/votes.
- **`useLoadObjects` returns `undefined` forever when no objects are in view.**
  With an empty id list it never subscribes to comments/votes, so the merged result
  never resolves. "Empty area" is indistinguishable from "still loading" for
  consumers that pass the result back in as `data`.
- **Longitude is not really filtered.** The bounds query compares `GeoPoint`s,
  which orders by latitude first, so the longitude bound is not honoured; the code
  notes `geofirestore-js` as the intended fix.
- **Expiry is filtered client-side** (`valid_until >= now`) because the server-side
  `where` clause is commented out — it would need a composite index with `loc`.
- **Deleting an object = setting `valid_until` to now** (`closeObject`); nothing is
  ever removed from Firestore.
- **Votes are not deduplicated server-side.** `userVoted` is computed client-side by
  scanning the `votes` collection.

## Further reading

- [docs/development.md](docs/development.md) — setup, env vars, running, deploying, troubleshooting
- [docs/high-level-structure.md](docs/high-level-structure.md) — architecture and data flow
- [docs/react-sdk.md](docs/react-sdk.md) — full SDK API reference
- [docs/DB.md](docs/DB.md) — Firestore collections, fields, rules and indexes
- [README.md](README.md) — user-facing overview and embedding instructions
