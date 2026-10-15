# FirebaseUI v7 migration

Status: implemented; plan and implementation reviewed.

## Problem and target

`firebaseui@6.1.0` only declares Firebase `^9.1.3 || ^10.0.0` as a peer. The
workspaces use Firebase 12, leaving an invalid dependency graph for npm consumers.
FirebaseUI's replacement, `@firebase-oss/ui-react@7.1.0`, supports Firebase 11/12
and React 19. This migration keeps Firebase 12 and the Google popup sign-in flow.

## Implementation contract

- Replace the SDK's `firebaseui` peer/dev dependency with regular dependencies on
  `@firebase-oss/ui-react`, `@firebase-oss/ui-core`, and `@firebase-oss/ui-styles` v7.
  Remove the webapp's `firebaseui` dependency; its login UI comes from the SDK.
- Narrow SDK peers to Firebase `^11.0.0 || ^12.0.0` and React / React DOM
  `^19.0.0`. Release as `0.1.0-rc11` and update the webapp's SDK range.
- Keep `initFirebase()`, `getFirebaseApp()`, compat user types, auth subscriptions,
  and Firestore calls intact. Initialize FirebaseUI with the modular app returned
  by `getApp(getFirebaseApp().name)`. Do not create a default or second Firebase app
  or access private `_delegate` properties.
- Implement Google-only login in the existing SDK `CommunityDialog`, using
  `FirebaseUIProvider`, `OAuthScreen`, and `GoogleSignInButton`. Import the bundled
  FirebaseUI CSS, check it with MUI's reset, and scope any local overrides.
- Keep the UI store stable across React StrictMode renders and dialog reopening;
  reuse the public `$config` registry, keyed by the Firebase app name, and pass that
  name to `initializeUI` so its setters address the same store. The provider only
  subscribes to the store; there is no v6-style `start()`/`reset()` lifecycle.
  No module-level Firebase initialization: hosts must still select their config
  before first render.
- Preserve the existing return-to-current-URL behavior after successful sign-in.
  Use the OAuth screen's stable success callback so completion of its MFA flow
  also returns to the current URL. A popup failure must leave an actionable error
  and permit another attempt; use the button's built-in translated error and
  pending state handling.
- Extend `Login` with optional `policies: { termsOfServiceUrl: string;
  privacyPolicyUrl: string }`. The webapp's `Login` becomes a wrapper supplying
  its existing absolute `/terms` and `/privacy` URLs. SDK callers need no provider.
- Do not add other providers, email/password, or phone sign-in. Do not migrate
  Firestore or all auth consumers to the modular API as part of this change.

## Verification

1. Extend the existing Playwright login fixture before implementation and confirm
   that the new behavior assertions fail on the old widget.
2. Check both SDK and webapp login under StrictMode, close/reopen, one Google button,
   site policy URLs, and a simulated popup cancellation with a retry. Do not sign
   in to a live account or write to Firestore from automated tests.
3. Exercise the shared named-app auth session with a local test fixture or Firebase
   Auth emulator; confirm the compat `AuthProvider` observes the modular sign-in
   and compat sign-out without creating a default app. Assert that successful
   Google sign-in returns to the current URL, including path, query, and fragment.
4. Run `yarn build` and `yarn test:e2e`; confirm a frozen lockfile install and
   `npm ls firebase @firebase-oss/ui-react @firebase-oss/ui-core --all` have no
   FirebaseUI peer conflict. Check the package CSS export in the Vite build.
5. Request a read-only implementation review and resolve concrete findings.

A real Google account login and deployed OAuth configuration remain manual checks.

## Verification results

- The new SDK policy-link test failed against the v6 widget, then passed with v7.
- `yarn build` passed for both workspaces, including the new CSS imports.
- `yarn test:e2e` passed all 17 Chromium tests, including the five login cases.
  The auth fixture replaces the popup strategy, fulfills Auth emulator REST calls
  locally, and exercises the real credential exchange, persisted session after a
  full reload, compat auth subscription, and compat sign-out. No emulator server
  or live Google account is needed for these checks.
- A focused TypeScript check of the login fixture passed in addition to the
  workspace type checks.
- `yarn install --frozen-lockfile --offline --ignore-scripts --non-interactive`
  passed. `npm ls firebase @firebase-oss/ui-react @firebase-oss/ui-core --all`
  exited successfully with Firebase 12.18.0 and FirebaseUI 7.1.0.
- The read-only plan and implementation reviews found no unresolved issues.

## References

- [FirebaseUI migration guide](https://github.com/firebase/firebaseui-web/blob/main/MIGRATION.md)
- [React setup](https://github.com/firebase/firebaseui-web/blob/main/GETTING_STARTED.md)
- [FirebaseUI peer requirements](https://github.com/firebase/firebaseui-web/blob/main/pnpm-workspace.yaml)
- [Firebase compat/modular coexistence](https://firebase.google.com/docs/web/modular-upgrade)
