## 0.1.0-rc10

- Support React and React DOM 19. The peer range is now `^18.0.0 || ^19.0.0`
  and the workspace builds and tests on React 19.2.
- Move to the Firebase compat layer: peers are now `firebase` 9 through 12 and
  `firebaseui@^6`. Firebase 7 and 8 and firebaseui 4 and 5 are no longer supported.
  Type imports such as `firebase.User` come from `firebase/compat/app`.
- Build with TypeScript 7 targeting ES2020 and the automatic JSX runtime. The
  published `dist/` no longer contains ES5 helpers or `React.createElement`.
- Drop the unused jest, Babel and testing-library dev tooling and the `test`
  script.

## 0.1.0-rc9

- Replace Semantic UI with MUI 9.4 and Emotion. Refresh map controls, post forms,
  cards, comments, and sign-in dialogs with a shared teal theme.
- Require React and React DOM 18; React 16 is no longer supported.
- Export `CommunityMapTheme`, `communityMapTheme`, and `CommunityDialog` for
  consistent styling in consuming applications. `CommunityMap` applies the theme
  to its own UI without resetting the host page's CSS.
- `type2icon` now returns a MUI SVG icon component instead of a Semantic UI icon
  name. Render it with `const Icon = type2icon(type); <Icon />`.

## 0.1.0-rc8

- Replace Google Maps with MapLibre GL JS and the keyless OpenFreeMap basemap.
- Replace the Google-specific `mapApiKey` and `mapStyles` props with the
  provider-neutral `mapStyle` prop and export `OPEN_FREE_MAP_STYLES`.
- Use Firebase's default ESM export so Firestore and Auth services remain
  available at runtime in Vite bundles.
- Let MapLibre own interactive camera state to avoid re-entrant renders when
  panning or zooming under React 16.

## 0.1.0-rc7

- Build the SDK with TypeScript 5.9 and type `detectLocation()` as `Loc`, matching
  the value it has always returned.

## 0.1.0-rc6

- Return `null` from `useUserPublicInfo` when a one-time profile lookup does not
  find a document, matching the subscribed lookup behavior.

## 0.1.0-rc4

Added optional arguments _defaultCenter_ and _defaultZoom_ to _CommunityMap_ component.
