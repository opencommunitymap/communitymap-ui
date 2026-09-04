# Tech Story: Documenting the project for AI Agents

## Status: Phase 1 delivered

The documentation set now exists. What was planned as a single `docs/react-sdk.md`
grew into four documents plus an agent entry point:

| Document | Covers |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Entry point for AI agents: layout, commands, conventions, traps, known limitations |
| [docs/development.md](development.md) | Setup, environment variables, build order, verification, deployment, troubleshooting |
| [docs/high-level-structure.md](high-level-structure.md) | Architecture, data flow, workspace responsibilities |
| [docs/react-sdk.md](react-sdk.md) | Full SDK API reference — components, hooks, write functions, types, recipes |
| [docs/DB.md](DB.md) | Firestore collections, security rules, composite indexes |

## Introduction

The `@opencommunitymap/react-sdk` is the core of the Open Community Map project,
providing the map, the data layer and the UI elements that the webapp and 3rd-party
integrations build on. Documentation used to be limited to a README, which slowed
down human onboarding and left AI agents guessing at conventions that only exist in
the code.

## The challenge

Documentation that agents can actually use must be:

- **Machine-readable** — predictable structure, explicit file paths, no prose-only prerequisites.
- **Comprehensive** — installation through advanced integration, including the parts that are broken.
- **Executable** — snippets that can be run and verified rather than described.
- **Honest** — the traps matter more than the happy path. An agent that does not know
  `yarn build` starts with `rm -rf dist` will "discover" a broken workspace and start
  fixing the wrong thing.

## Phase 1: Core concepts & API reference — done

- [x] **1.1 Installation & setup** — [react-sdk.md § Installation](react-sdk.md#installation),
      including the peer dependencies (`firebase`, `firebaseui`, `react`) that npm
      will not install, and the Google Maps key requirement.
- [x] **1.2 Component catalog** — every exported component with its props:
      `CommunityMap`, `Maps`/`MapItem`, the three object components, the three
      add-forms and the chrome widgets. The four components that are deliberately
      *not* exported are listed too, so agents stop trying to import them.
- [x] **1.3 Type definitions** — [react-sdk.md § Types](react-sdk.md#types) documents
      every exported type from `src/index.ts`, plus the utilities (`reportError`,
      `detectLocation`, `directMessageId`, `initFirebase`, `getFirebaseApp`).
      Source of truth is `react-sdk/src/index.ts`, not `dist/index.d.ts` — the latter
      is generated and is deleted on every build.

## Phase 2: Advanced topics & integration — done

- [x] **2.1 State management** — auth context and the three-state `useAuth()` result;
      the realtime-subscription model where writes need no refetch.
      ([react-sdk.md § Hooks](react-sdk.md#hooks),
      [high-level-structure.md § Data flow](high-level-structure.md#data-flow-for-objects))
- [x] **2.2 Event handling** — `onChange`, `onClickObject`, `onObjectModalClose` and
      the three-valued `renderObject` contract.
- [x] **2.3 Integration with webapp** — [high-level-structure.md § Cross-workspace integration](high-level-structure.md#cross-workspace-integration),
      including why the webapp reads `dist/` and what that implies for every edit.
- [x] **2.4 Error handling** — the `catch(reportError)` convention, the write
      functions that `alert` and throw without a user, and the expected one-second
      `dm-items` retry.
- [x] **2.5 Extensibility** — widget slots, `renderObject`/`renderAuthor`, supplying
      your own `data`, and `origin`/`filterOrigin` for keeping a 3rd party's content
      separate. ([react-sdk.md § Recipes](react-sdk.md#recipes))

## Corrections made along the way

Documenting the code surfaced drift between the old `docs/DB.md` and what the code
actually writes:

- The collection is `objects`, not `object`.
- Votes store `value`, not `vote`.
- Direct-message keys join uids with `-`, not `_` (`directMessageId()`).
- `objects` documents also carry `origin`, `short_description`, `url`, `logoURL` and
  `external_data`, and `type` includes `story`.
- The index on `objects.open` is legacy — no code reads or writes `open`.

## Next steps

The gap that remains is **executable verification**, not prose:

1. There is no working test suite. `react-sdk`'s `yarn test` runs `jest` with no
   test files and no config, and the webapp has no test command. Add a focused
   browser smoke suite for the map and routing before broader refactors.
2. Add a lint step to CI once the codebase has a shared lint configuration.
3. Keep the API reference honest as the SDK moves past `0.1.0-rc7`: a change to
   `react-sdk/src/index.ts` should come with a `CHANGELOG.md` entry and a matching
   edit in [react-sdk.md](react-sdk.md).
