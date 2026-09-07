# Architecture / High-Level Structure

How the pieces of this repository fit together. For the API surface of the SDK see
[react-sdk.md](react-sdk.md); for the persisted data model see [DB.md](DB.md).

## Shape of the system

```
                    ┌─────────────────────────────────────────┐
   browser          │  webapp  (Vite, communitymap.online)    │
                    │  routing · modals · profile · DMs · legal│
                    └───────────────────┬─────────────────────┘
                                        │ imports from dist/
                    ┌───────────────────▼─────────────────────┐
                    │  @opencommunitymap/react-sdk            │
                    │  CommunityMap · hooks · object widgets  │
                    └──────┬──────────────────────┬───────────┘
                           │                      │
                  MapLibre GL JS            firebase (web SDK)
                           │                      │
                 OpenFreeMap / OSM         Firestore + Auth
                                                  │
                                    (separate repo) Cloud Functions
                                    /api/v0/object, api-keys
```

There is **no server in this repository**. The browser talks to Firestore directly;
[firestore.rules](../firestore.rules) is the only authorisation layer. The REST API
used by 3rd-party integrations lives in
[communitymap-cloud-functions](https://github.com/opencommunitymap/communitymap-cloud-functions)
and is exposed through the hosting rewrites in [firebase.json](../firebase.json).

## Workspaces

Yarn v1 workspaces, declared in the root [package.json](../package.json):

- **`react-sdk/`** — `@opencommunitymap/react-sdk`, the library that holds
  essentially all of the product logic. Published to npm; also consumed locally by
  the webapp through the workspace symlink.
- **`webapp/`** — `community-map`, a Vite shell: routing, modals, and
  the few features that only make sense on the hosted site.

The webapp depends on the SDK's **compiled output** (`react-sdk/dist/index.js`), so
the SDK must be built before the webapp sees any change. See
[development.md](development.md#the-build-order-that-matters).

## react-sdk

```
react-sdk/src/
├── index.ts              # barrel export + ALL shared type definitions
├── modules/
│   ├── CommunityMap.tsx  # the top-level component; composition root
│   ├── DB.tsx            # every Firestore read/write, exposed as hooks + functions
│   └── Auth.tsx          # AuthProvider / useAuth over Firebase Auth
├── components/           # presentational widgets, one CSS file each
│   ├── Maps.tsx          # MapLibre wrapper, markers, bounds + map style
│   ├── Chat.tsx          # renders chat/request/offer/donation objects + add-form
│   ├── Place.tsx         # renders place objects + add-form
│   ├── Story.tsx         # renders story objects + add-form
│   ├── Comments.tsx  LikeWidget.tsx  AuthorWidget.tsx      # internal
│   ├── CloudinaryImageUpload.tsx  PointingSegment.tsx  Pin.tsx
│   ├── Login.tsx  ProfileWidget.tsx  NavigationWidget.tsx  # default chrome
│   └── *.css             # copied into dist/ by sync-glob at build time
└── utils/
    ├── firebase.ts       # initFirebase / getFirebaseApp (named app!)
    ├── renderAuthor.ts   # context for the renderAuthor callback
    ├── index.ts          # reportError, directMessageId, detectLocation
    └── .fb-conf-{dev,prod}.js   # HIDDEN dotfiles: the actual Firebase configs
```

Two conventions worth knowing before editing:

- **`src/index.ts` is both the barrel and the type module.** Components import their
  types back from the package root (`import { ObjectItem } from '..'`). A component
  is not part of the public API until it is re-exported there — `Comments`,
  `LikeWidget` and `CloudinaryImageUpload` deliberately are not.
- **Widgets are replaceable, not configurable.** Rather than growing props, the SDK
  takes render callbacks and element slots (`renderObject`, `renderAuthor`,
  `profileWidget`, `navigationWidget`, `centerPin`) so a host app can swap any part
  of the chrome. Passing `null` hides a slot; omitting it keeps the default.

### CommunityMap: the composition root

[modules/CommunityMap.tsx](../react-sdk/src/modules/CommunityMap.tsx) wires
everything together:

1. Wraps its implementation in `AuthProvider`, so `useAuth()` works for anything
   rendered inside.
2. Renders `Maps`, which reports `(center, bounds, zoom)` on every pan/zoom.
3. Feeds those bounds into `useLoadObjects()`, which opens a realtime Firestore
   subscription — unless the host passes its own `data`, in which case loading is
   skipped entirely (`skip` flag).
4. Renders one `MapItem` per object, delegating the visual to `renderObject` and
   falling back to `defaultObjectRender`, which picks by `item.type`:
   `place → Place`, `story → Story`, everything else → `Chat`.
5. Manages the "expanded object" modal, either from internal state or from the
   controlled `showObjectId` prop (the webapp drives it from the `/object/:id` route).

The `renderObject` contract is three-valued and easy to get wrong:
return **JSX** to draw your own, **`true`** to fall through to the default
rendering, and **`null`/`false`** to hide that object entirely.

### Data flow for objects

```
map pan/zoom
  → Maps.onChange(center, bounds, zoom)
  → useLoadObjects(bounds, user, filterOrigin)
      ├─ objects:  onSnapshot(collection('objects')
      │              .where('loc', '>', GeoPoint(minLat, minLng))
      │              .where('loc', '<', GeoPoint(maxLat, maxLng))
      │              [.where('origin', '==', filterOrigin)])
      │            then client-side filter: valid_until >= now
      ├─ comments: onSnapshot(collection('comments')
      │              .where('object_id', 'in', firstTenObjectIds))
      └─ votes:    onSnapshot(collection('votes')
                     .where('object_id', 'in', firstTenObjectIds))
  → merged in useMemo into ObjectItem[] carrying comments/votesCount/userVoted
```

Writes are plain async functions from the same module — `postObject`, `leaveComment`,
`voteUp`, `closeObject`, `saveUserPublicInfo`. The object, comment and vote writes
throw (and `alert`) when there is no authenticated user; `saveUserPublicInfo`
relies on Firestore rules to reject an unauthorised write. Because every subscribed
read is an `onSnapshot` listener, the UI updates itself after a write; nothing
refetches manually.

Known limitations of this pipeline (comments/votes capped at 10 objects, longitude
not truly filtered, client-side expiry) are listed in
[AGENTS.md](../AGENTS.md#known-limitations-already-in-the-code--dont-fix-by-accident).

### Firebase initialisation

`initFirebase(env)` creates a **named** Firebase app, `__open_community_map__`,
from one of the two committed dotfile configs (or from a config object passed by the
host). Everything in the SDK goes through `getFirebaseApp()`, which lazily
initialises with the **production** config if no one did it first. Consequence: a
host that forgets `initFirebase('development')` silently reads and writes production
data, and `firebase.app()` (the unnamed default) will not find this app at all.

## webapp

```
webapp/
├── e2e/map.spec.ts      # Chromium smoke coverage for map + routing
├── playwright.config.ts
└── src/
    ├── index.tsx            # React 19 createRoot entry point
    ├── App.tsx              # FirebaseInitializer → AuthProvider → Router → Home
    ├── types.d.ts           # InitialAppParams / EmbedParams (query-string shapes)
    ├── firebaseConfig.ts    # legacy, unused
    └── components/
        ├── index.tsx        # barrel
        ├── NewContentWidget.tsx   # "I want to post" — selects an add form
        ├── ProfileWidgetPlus.tsx  # profile editing + unread DM badge
        ├── DirectMessage.tsx      # DM modal and dialog list
        ├── UserPage.tsx           # public profile + DM button
        ├── Login.tsx              # firebaseui with tos/privacy links
        └── SplashScreen.tsx  TermsOfService.tsx  PrivacyPolicy.tsx
```

`App.tsx` boots in a fixed order — `FirebaseInitializer` (blocks on
`initFirebase`, shows the splash) → `AuthProvider` → `Router` → `Home`. `Home`
renders `CommunityMap` and layers the site-specific bits on top of it:
`ProfileWidgetPlus` replaces the SDK's default profile widget, `renderAuthor` turns
author names into links to `/users/:uid`, and `NewContentWidget` posts through the
SDK's `postObject`.

Routing is Modal-based: `/object/:objectId` is read with `useRouteMatch` and pushed
into `CommunityMap`'s `showObjectId`; `/users/:userId`, `/my-messages`,
`/direct-messages/:dmKey`, `/terms` and `/privacy` each render a MUI `Dialog`
over the map rather than a separate page. In embed mode the router is mounted with
`basename="/embed"`.

### Query parameters

Parsed once at module load from `window.location.search` (numbers and booleans
coerced) into `InitialAppParams`: `filterOrigin`, `centerLat`, `centerLng`,
`autolocate`, `canAdd`, and `theme` (`standard`, `silver`, or `dark`). These options
work on non-embed URLs too. `appId` is mandatory in embed mode and becomes the
`origin` of objects posted from the embed; it is ignored outside embed mode.

## Cross-workspace integration

The webapp imports only from the package root:

```tsx
import {
  CommunityMap, Pin, useAuth, AuthProvider,
  postObject, initFirebase, useMyDirectMessages, directMessageId,
} from '@opencommunitymap/react-sdk';
```

Nothing reaches into `react-sdk/src/…` or `dist/…` directly, and the SDK never
imports from the webapp. When adding something the webapp needs, export it from
[react-sdk/src/index.ts](../react-sdk/src/index.ts), rebuild the SDK, bump its
version and note the change in [CHANGELOG.md](../react-sdk/CHANGELOG.md).
