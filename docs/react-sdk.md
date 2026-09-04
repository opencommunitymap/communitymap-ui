# `@opencommunitymap/react-sdk` — API Reference

Generated from the source of truth,
[react-sdk/src/index.ts](../react-sdk/src/index.ts) and the modules it re-exports.
Version `0.1.0-rc6`. The package is in early alpha; the interface still changes
between release candidates — check [CHANGELOG.md](../react-sdk/CHANGELOG.md).

For a task-oriented overview see [high-level-structure.md](high-level-structure.md);
for the stored shapes behind these types see [DB.md](DB.md).

## Contents

- [Installation](#installation)
- [Getting started](#getting-started)
- [Components](#components)
- [Hooks](#hooks)
- [Write functions](#write-functions)
- [Utilities](#utilities)
- [Types](#types)
- [Recipes](#recipes)

## Installation

```bash
yarn add @opencommunitymap/react-sdk firebase firebaseui
# or: npm i @opencommunitymap/react-sdk firebase firebaseui
```

`firebase@^7`, `firebaseui@^4`, `react@^16` and `react-dom@^16` are **peer**
dependencies — the SDK will not install them for you. `semantic-ui-react`,
`semantic-ui-css`, `google-map-react`, `dayjs` and `classnames` come bundled as
regular dependencies, and `semantic-ui-css/semantic.min.css` is imported by the SDK
itself.

You also need a [Google Maps JS API key](https://developers.google.com/maps/documentation/javascript/get-api-key),
passed as `mapApiKey`.

The package targets browser applications and expects a bundler that understands ES
modules and CSS imports. It is not directly loadable with Node.js `require()`.

## Getting started

The smallest useful app — note the sized container, since the map fills its parent:

```jsx
import React from 'react';
import { CommunityMap } from '@opencommunitymap/react-sdk';

export const App = () => (
  <div style={{ width: '100%', height: 500 }}>
    <CommunityMap mapApiKey={process.env.REACT_APP_GOOGLE_API_KEY} autolocate />
  </div>
);
```

`CommunityMap` provides its own `AuthProvider` and lazily initialises Firebase
against the **production** project. To target a different one, call `initFirebase`
before rendering anything:

```jsx
import { initFirebase } from '@opencommunitymap/react-sdk';

initFirebase('development');        // bundled dev config
initFirebase({ apiKey: '…', … });   // or your own Firebase project
```

If you use SDK **hooks outside** of `CommunityMap` (e.g. `useAuth`,
`useMyDirectMessages`), wrap that part of the tree in `AuthProvider` yourself.

## Components

### `CommunityMap`

The top-level component: map, object loading, object rendering, expanded-object
modal, and the default profile/navigation chrome.

| Prop | Type | Description |
| --- | --- | --- |
| `mapApiKey` | `string` | Google Maps JS API key. |
| `center` | `Loc` | Controlled centre. Pair with `onChange` to drive the map yourself. |
| `zoom` | `number` | Controlled zoom. |
| `defaultCenter` | `Loc` | Initial centre (uncontrolled). Falls back to `42.69, 23.32`. |
| `defaultZoom` | `number` | Initial zoom (uncontrolled). Falls back to `18`. |
| `data` | `ObjectItem[]` | Supply objects yourself; when present the SDK skips its own Firestore subscription entirely. |
| `mapStyles` | `MapTypeStyle[]` | Google Maps styling, e.g. from [mapstyle.withgoogle.com](https://mapstyle.withgoogle.com/). Default style only hides POI labels. |
| `centerPin` | `JSX.Element \| null` | Element drawn at the map centre. `null` hides it. |
| `profileWidget` | `JSX.Element \| null` | Replaces the built-in `ProfileWidget`. `null` hides it. |
| `navigationWidget` | `JSX.Element \| null` | Replaces the built-in `NavigationWidget`. `null` hides it. |
| `showZoomControls` | `boolean` | Google's zoom buttons. Default `true`. |
| `autolocate` | `boolean` | Ask the browser for the user's location on mount. Failures are swallowed. |
| `filterOrigin` | `string` | Only load objects whose `origin` matches — i.e. one 3rd-party app's content. |
| `renderObject` | `RenderObjectCallback` | Custom object rendering, see below. |
| `renderAuthor` | `RenderAuthorCallback` | Custom author rendering wherever a name appears. |
| `onChange` | `(center: Loc, bounds: MapBounds, zoom: number) => void` | Fired on mount and on every pan/zoom. |
| `onClickObject` | `(item: ObjectItem) => boolean \| undefined \| null` | Return a truthy value to also open the built-in modal; falsy suppresses it. |
| `showObjectId` | `string` | Controlled: open this object's modal (used for deep links). |
| `onObjectModalClose` | `() => void` | Called when that modal closes. |

**`renderObject` is three-valued.** Get this wrong and objects silently disappear:

```tsx
renderObject={({ item, currentUser, expanded, defaultOnClickHandler }) => {
  if (item.type === 'place') return <MyPlace item={item} />;  // JSX → your rendering
  if (item.type === 'story') return true;                     // true → SDK default
  return null;                                                // falsy → hide it
}}
```

Default rendering maps `place → Place`, `story → Story`, and everything else
(`chat`, `request`, `offer`, `donation`) → `Chat`. Collapsed items are additionally
wrapped in a `PointingSegment` speech bubble.

### `Maps` / `MapItem`

Thin wrapper over `google-map-react` and the marker placeholder it recognises.
Useful only if you are building your own map instead of using `CommunityMap`.

```tsx
<Maps mapApiKey={key} defaultCenter={{ latitude, longitude }} onChange={…}>
  <MapItem lat={item.loc.latitude} lng={item.loc.longitude}>{…}</MapItem>
</Maps>
```

`MapsProps`: `center`, `zoom`, `defaultCenter`, `defaultZoom`, `styles`, `centerPin`,
`showZoomControls`, `mapApiKey`, `onChange`. `MapItem` takes `lat`/`lng` numbers —
`google-map-react` reads them off the child element, so the props look unused inside
the component but are required.

### Object components

`Chat`, `Place` and `Story` all take the same
[`ObjectItemComponentProps`](#objectitemcomponentprops) and differ only in what they
show — `Place` adds logo, short description and website link; `Chat` and `Story`
show author + timestamp, a reply button when collapsed, and a close/delete button
for the owner. Each renders collapsed by default and fuller when `expanded`.

### Add-object forms

`AddNewChatObject`, `AddNewPlaceObject`, `AddNewStoryObject` — each takes
`{ type: ObjectItemInput['type']; onPost: (data: ObjectItemInput) => void }` and
renders a Semantic UI form. They only build the `ObjectItemInput`; **persisting is
the caller's job** via `postObject`:

```tsx
<AddNewChatObject type="request" onPost={(item) => postObject(user, loc, item)} />
```

`AddNewChatObject` offers an expiry dropdown (5 minutes … 7 days) and defaults to 12
hours. `AddNewStoryObject` also defaults to 12 hours. `AddNewPlaceObject` hard-codes
`valid_until: '2100-01-05T09:00:00.000Z'` — places are effectively permanent — and
shows the Cloudinary logo upload only when `REACT_APP_CLOUDINARY_CLOUD_NAME` is set
at build time.

### Chrome and small components

| Component | Props | Notes |
| --- | --- | --- |
| `ProfileWidget` | — | Sign-in button, or a dropdown with the email and Log out. |
| `NavigationWidget` | `{ onChangePosition: (loc: Loc) => void }` | The "locate me" button. |
| `Login` | `{ title?: string; onClose?: () => void }` | firebaseui modal; Google sign-in only, popup flow. |
| `AuthorWidget` | `{ userId: string; watchForChanges?: boolean }` | Resolves a uid to a display name, honouring `renderAuthor`. |
| `Pin` | `{ color?: string }` | The map pin SVG. |
| `PointingSegment` | — | Speech-bubble wrapper used for collapsed map items. |

`type2icon(type)` and `type2title(type)` map an object type to its Semantic UI icon
name and human label (`request → 'hand paper' / 'Ask Help'`, etc.) — use them when
building your own post UI so it matches.

**Not exported** (internal to the SDK): `CommentsList`, `PostCommentWidget`,
`LikeWidget`, `CloudinaryImageUpload`.

## Hooks

### `useAuth(): AuthUser`

Current Firebase user from context. Three states that must be distinguished:
`undefined` = still resolving (render a loader/splash), `null` = signed out,
`firebase.User` = signed in. Requires an `AuthProvider` ancestor.

### `AuthProvider`

Subscribes to `onIdTokenChanged` and publishes the result through context.
`CommunityMap` already includes one; nesting a second is harmless.

### `useLoadObjects(mapBounds, user, filterOrigin?, skip?): ObjectItem[] | undefined`

Realtime subscription to every object inside `mapBounds`, merged with its comments
and votes. Returns `undefined` while loading. Pass `skip` (or a `null` bounds) to
suspend loading. Caveats: comments/votes only resolve for the **first 10 objects**
(Firestore `in` limit), expiry is filtered client-side, the longitude bound is not
truly honoured by the `GeoPoint` range query, and an **empty result stays
`undefined`** rather than becoming `[]` — with no objects in view the hook never
subscribes to comments/votes, so it cannot distinguish "empty" from "loading".

### `useLoadSingleObject(id, user): ObjectItem | undefined`

Same for one object, with all of its comments (ordered by `created`) and votes.
`undefined` while loading; the underlying state is `null` when the document does not
exist.

### `useUserPublicInfo(userId, subscribe = false): UserProfile | null | undefined`

Public profile. `subscribe: true` keeps a live listener; otherwise it reads once.
`undefined` while loading, `null` when the user has no profile document.

### `useDirectMessage(dialogId)`

```ts
{ info: DirectMessageInfo | null | undefined;
  messages: DirectMessageItem[];
  postMessage: (message: string) => Promise<void>;
  updateLastMessageReadByMe: () => Promise<void>; }
```

`dialogId` must come from [`directMessageId`](#directmessageidme-other-string).
`postMessage` creates the dialog document on first use. There is a deliberate
one-second retry loop when the sub-collection is not yet readable right after
creation — that log line is expected, not a bug.

### `useMyDirectMessages(): { dialogs: DirectMessageInfo[] | null }`

All dialogs the signed-in user belongs to, newest first. Unread count is derived by
comparing `lastMsgId` with `lastReadBy[myUid]`.

### `useAsyncStatus(cb)`

```ts
const { status, func } = useAsyncStatus(() => saveUserPublicInfo(profile));
// status: { pending: boolean; success: boolean; error: string }
```

Small helper for wiring an async submit to button state. `func` ignores the
arguments it is called with and invokes the latest `cb`.

## Write functions

All are plain `async` functions rather than hooks. Object, comment and vote writes
take the current user and throw — after an `alert` — when it is `null`.
`saveUserPublicInfo` takes only the profile and relies on Firestore rules for
authorisation. Realtime subscriptions pick writes up on their own, so there is
nothing to refetch.

| Function | Effect |
| --- | --- |
| `postObject(user, loc, item, origin?)` | Adds a document to `objects` with `author`, `created`, `updated`, a `GeoPoint` `loc` and `origin \|\| null`. |
| `leaveComment(user, item, comment)` | Adds to `comments`. |
| `voteUp(user, item)` | Adds `{ value: 1 }` to `votes`. Not idempotent — nothing stops a second vote server-side. |
| `closeObject(user, item)` | Soft-delete: sets `valid_until` to now. Nothing is ever hard-deleted. |
| `saveUserPublicInfo(userInfo)` | Upserts `users-public/{id}`, preserving `created`. |

## Utilities

### `initFirebase(config?): firebase.app.App`

Initialises the named app `__open_community_map__`. Accepts `'production'`
(default), `'development'`, or a Firebase config object. Call it before rendering if
you do not want production.

### `getFirebaseApp(): firebase.app.App`

Returns that app, initialising it with the production config if nothing has yet.
Use this instead of `firebase.app()` — the unnamed default app is not what the SDK
creates. Handy for the odd thing the SDK does not wrap:

```ts
getFirebaseApp().auth().signOut();
```

### `detectLocation(): Promise<Coordinates>`

`navigator.geolocation.getCurrentPosition` as a promise, with
`enableHighAccuracy`. Rejects with a plain message when unsupported or denied. The
resolved value is structurally compatible with `Loc`.

### `directMessageId(me, other): string`

Deterministic dialog id: the two uids sorted lexicographically and joined with `-`,
so both participants compute the same key.

### `reportError(err, silent = false): void`

`console.error` plus an `alert` unless silenced. The convention throughout the SDK
is `promise.catch(reportError)`.

### `RenderAuthorProvider` / `useRenderAuthorCallback`

Context plumbing behind `CommunityMap`'s `renderAuthor` prop; only needed when
composing author rendering outside of `CommunityMap`.

## Types

All exported from the package root.

### `Loc`, `MapBounds`, `MapParams`

```ts
interface Loc { latitude: number; longitude: number }
interface MapBounds { minLat: number; maxLat: number; minLng: number; maxLng: number }
interface MapParams { center: Loc; bounds: MapBounds }
```

App code always uses `Loc`; the Firestore `GeoPoint` conversion happens inside the
SDK, as does the `{lat, lng}` conversion for Google Maps.

### `ObjectItemInput` / `ObjectItem`

```ts
interface ObjectItemInput {
  type: 'chat' | 'request' | 'offer' | 'donation' | 'place' | 'story';
  title: string;
  short_description?: string;
  description: string;
  logoURL?: string;
  url?: string;
  external_data?: any;      // free-form payload for 3rd-party integrations
  valid_until: string;      // ISO timestamp; the object hides once it passes
}

interface ObjectItem extends ObjectItemInput {
  id: string;
  author: string;           // uid
  loc: Loc;
  created: string;          // ISO timestamp
  comments?: ObjectComment[];
  userVoted: boolean;
  votesCount: number;
}
```

`ObjectItem` is the *merged* view — `comments`, `userVoted` and `votesCount` come
from separate collections and are assembled by the loading hooks, not stored on the
document. `origin` is written by `postObject` but is not part of the type.

### `ObjectItemComponentProps`

```ts
interface ObjectItemComponentProps {
  item: ObjectItem;
  user: firebase.User | null;
  expanded?: boolean;
  onClick?: () => void;
  onVote: () => Promise<any>;
  onComment: (comment: string) => Promise<any>;
  onClose: () => Promise<any>;
}
```

The contract every object component implements. Write your own against this and it
drops straight into `renderObject`.

### `RenderObjectCallback` / `RenderAuthorCallback`

```ts
type RenderObjectCallback = (props: {
  item: ObjectItem;
  currentUser: firebase.User | null;
  expanded: boolean;
  defaultOnClickHandler?: () => void;
}) => JSX.Element | boolean | null;

type RenderAuthorCallback = (userId: string, user: UserProfile | null) => JSX.Element;
```

### Remaining types

```ts
type AuthUser = undefined | null | firebase.User;

interface ObjectComment { id: string; object_id: string; author: string; comment: string; created: string }
interface ObjectVote    { object_id: string; author: string; value: number; created: string }
interface UserProfile   { id: string; name: string; created?: string; updated?: string }

interface DirectMessageInfo {
  id: string; members: string[]; created: string; updated: string;
  lastMsgId: string; lastReadBy: { [uid: string]: string };
}
interface DirectMessageItem { id: string; author: string; timestamp: string; content: string }
```

## Recipes

### Full control over the map and its data

```jsx
const MapContent = () => {
  const [center, setCenter] = useState();
  const [zoom, setZoom] = useState();
  const [bounds, setBounds] = useState();

  const user = useAuth();
  const objects = useLoadObjects(bounds, user || null, 'projectX');

  return (
    <CommunityMap
      mapApiKey={GOOGLE_API_KEY}
      autolocate
      mapStyles={mapStyles}
      centerPin={<Pin color="#79CAB5" />}
      center={center}
      zoom={zoom}
      data={objects || []}
      showZoomControls={false}
      renderObject={({ item }) => <MapItemWidget item={item} />}
      navigationWidget={
        <Navigation
          autolocate={() => detectLocation().then(setCenter).catch(reportError)}
          zoomIn={() => setZoom((z = 18) => z + 1)}
          zoomOut={() => setZoom((z = 18) => z - 1)}
        />
      }
      onChange={(center, bounds, zoom) => {
        setCenter(center);
        setBounds(bounds);
        setZoom(zoom);
      }}
    />
  );
};

export const Map = () => (
  <AuthProvider>
    <MapContent />
  </AuthProvider>
);
```

Passing `data` disables the SDK's own subscription, so you own loading — here the
same `useLoadObjects` hook is called one level up with the origin filter, where the
app can further filter or augment the result. Because `useAuth` is also outside
`CommunityMap`, this component supplies its own `AuthProvider`.

### Deep-linking to an object

```jsx
const match = useRouteMatch('/object/:objectId');

<CommunityMap
  showObjectId={match?.params?.objectId}
  onClickObject={(obj) => { history.push(`/object/${obj.id}`); return true; }}
  onObjectModalClose={() => history.push('/')}
/>
```

This is exactly what [webapp/src/App.tsx](../webapp/src/App.tsx) does.

### Posting from your own UI

```jsx
const user = useAuth();
const [loc, setLoc] = useState(defaultCenter);

<CommunityMap onChange={(center) => setLoc(center)} … />
<MyForm onSubmit={(item) => postObject(user, loc, item, 'my-app-id').catch(reportError)} />
```

The fourth argument becomes the object's `origin`, which is what `filterOrigin`
matches on — pass your app id there to keep your content separable from everyone
else's.
