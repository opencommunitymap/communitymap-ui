# Database

The database is [Firebase Firestore](https://firebase.google.com/docs/firestore),
written to directly from the browser.
There is no server-side validation layer in this repo other than
[firestore.rules](../firestore.rules).

Conventions across all collections:

- **Timestamps are ISO 8601 strings** (`new Date().toISOString()`), never Firestore
  `Timestamp` objects. They are compared as strings, which works because ISO strings
  sort chronologically.
- **Locations are Firestore `GeoPoint`s** on the document; the SDK converts them to
  `Loc` (`{latitude, longitude}`) in app code.
- **Document ids are auto-generated** except where noted.
- **Nothing is ever hard-deleted.**

The TypeScript view of these shapes lives in
[react-sdk/src/index.ts](../react-sdk/src/index.ts); the reads and writes are all in
[react-sdk/src/modules/DB.tsx](../react-sdk/src/modules/DB.tsx).

## `objects`

The map items. Key: auto id.

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `'chat' \| 'request' \| 'offer' \| 'donation' \| 'place' \| 'story'` | Decides which component renders it. |
| `title` | string | For chats/stories, falls back to the message text when no topic is given. |
| `description` | string | Main body. |
| `short_description` | string \| null | Places only. |
| `url` | string \| null | Places only; normalised to `https://` on display. |
| `logoURL` | string \| null | Places only; Cloudinary secure URL. |
| `external_data` | any | Free-form payload for 3rd-party integrations. |
| `author` | string | uid. Immutable — the rules pin writes to the author. |
| `loc` | GeoPoint | Position on the map. |
| `origin` | string \| null | 3rd-party app id (the embed's `appId`), or `null` for the main site. What `filterOrigin` matches. |
| `created` | ISO timestamp | |
| `updated` | ISO timestamp | |
| `valid_until` | ISO timestamp | Expiry. An object is hidden once this passes; "closing" an object sets it to now. Places use `2100-01-05T09:00:00.000Z`. |

Queried by geographic range plus optional `origin`; expiry is filtered client-side
after the snapshot arrives (the `valid_until` `where` clause is commented out in
`useLoadObjects` because it would need another composite index).

> `firestore.indexes.json` still carries an index on `open` + `loc`. No current code
> reads or writes an `open` field — it is a leftover from before `valid_until`.

## `comments`

Key: auto id.

| Field | Type | Notes |
| --- | --- | --- |
| `object_id` | string | Document id in `objects`. |
| `author` | string | uid. |
| `comment` | string | |
| `created` | ISO timestamp | |

Loaded per object (`where('object_id', '==', id).orderBy('created')`), or in bulk for
the visible map with `where('object_id', 'in', ids)` — which Firestore caps at **10
ids**, so objects past the tenth on screen show no comments.

## `votes`

One document per vote. Key: auto id.

| Field | Type | Notes |
| --- | --- | --- |
| `object_id` | string | Document id in `objects`. |
| `author` | string | uid. |
| `value` | number | Currently always `+1`. |
| `created` | ISO timestamp | |

`votesCount` is the sum of `value` and `userVoted` is "some vote has my uid" — both
computed client-side. Nothing prevents a user from voting twice.

## `users-public`

Publicly readable profile. **Key: uid.**

| Field | Type |
| --- | --- |
| `name` | string |
| `created` | ISO timestamp |
| `updated` | ISO timestamp |

Written with `set()`, preserving the original `created`. A user with no profile
document simply has no document — reads return `null`.

## `direct-messages`

**Key: `` `${uid1}-${uid2}` ``, the two uids sorted lexicographically and joined with
a hyphen** — see `directMessageId()`. Both participants therefore derive the same id
without a lookup.

| Field | Type | Notes |
| --- | --- | --- |
| `members` | string[] | `[uid1, uid2]`. Drives all access control for the dialog. |
| `created` | ISO timestamp | |
| `updated` | ISO timestamp | Last message time; dialogs are listed by this, descending. |
| `lastMsgId` | string | Id of the newest message. |
| `lastReadBy` | `{ [uid]: msgId }` | Compare with `lastMsgId` for the unread badge. |

### `direct-messages/{id}/dm-items` (sub-collection)

Key: auto id.

| Field | Type |
| --- | --- |
| `author` | string (uid) |
| `content` | string |
| `timestamp` | ISO timestamp |

Posting a message writes the item, then updates the parent's `updated`, `lastMsgId`
and `lastReadBy.{uid}`. Right after a dialog is created the sub-collection listener
can fail once — the SDK retries after a second, which is why a "Cannot load dm-items"
debug line appears on the first message of a conversation.

## `api-keys`

Not touched by this repository — used by the
[cloud functions](https://github.com/opencommunitymap/communitymap-cloud-functions)
to authenticate 3rd-party API calls. Key: auto id.

| Field | Type | Notes |
| --- | --- | --- |
| `origin` | string | 3rd-party app id, e.g. `my-cool-app`. Ends up as `origin` on objects. |
| `token` | string | |
| `revoked` | boolean | |

## Security rules

[firestore.rules](../firestore.rules), summarised:

| Collection | Read | Create | Update | Delete |
| --- | --- | --- | --- | --- |
| `objects` | anyone | signed in, `author == uid` | signed in, own document | never |
| `votes` | anyone | signed in, `author == uid` | signed in, own document | never |
| `comments` | anyone | signed in, `author == uid` | signed in, own document | never |
| `users-public` | anyone | signed in, doc id `== uid` | signed in, own document | never |
| `direct-messages/{id}` | members only | signed in and in `members` | members only | never |
| `.../dm-items/{item}` | members of the parent dialog | members of the parent dialog | never | never |

Notable consequences: every object, comment, vote and profile is **world-readable**;
no rule validates field types, lengths or the value of a vote; and nothing can be
deleted through the client — expiry via `valid_until` is the only removal mechanism.

## Composite indexes

[firestore.indexes.json](../firestore.indexes.json) — keep it in sync with the
console using `cd webapp && yarn index_sync`.

All indexes use the `COLLECTION` query scope.

| Collection | Fields |
| --- | --- |
| `comments` | `object_id` ASC, `created` ASC |
| `direct-messages` | `members` CONTAINS, `updated` DESC |
| `objects` | `origin` ASC, `loc` ASC |
| `objects` | `open` ASC, `loc` ASC *(legacy — `open` is unused)* |

Adding a `where`/`orderBy` combination beyond these needs a new index here, and the
rules/indexes are deployed from the repo root (`firebase deploy`), not from `webapp`.
