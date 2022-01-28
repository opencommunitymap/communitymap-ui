The database we currently use is [Firebase Firestore](https://firebase.google.com/docs/firestore).

# Collections

## objects
Key: id
- type: string, (chat|request|offer|donation|place)
- title
- description
- author: uid
- created: ISO timestamp
- updated: ISO timestamp
- loc: Firestore GeoPoint
- valid_until: ISO timestamp

## users-public
Key: uid
- name: string
- created: ISO timestamp
- updated: ISO timestamp

## comments
key: id
- object_id: string, key from _objects_
- created: ISO timestamp
- author: uid
- comment: string

## votes
key: id
- object_id: string, key from _objects_
- created: ISO timestamp
- author: uid
- vote: number, currently only +1

## direct-messages
key: `${uid1}_${uid2}`, uid1 < uid2 lexicographically
- created: ISO timestamp
- lastMsgId: string
- lastReadBy: object, _{uid: msgId}_
- members: array<string>, [uid1, uid2]

### direct-messages > dm-items subcollection
key: id
- author: uid
- content: string
- timestamp: ISO string

## api-keys
key: id
- origin: string, 3rd party app id like my-cool-app
- token: string
- revoked: boolean

# Composite Indices

|Collection ID	|Fields indexed|Query scope		|
|---------------|--------------|--------------|
|direct-messages|members Arrays, updated Descending|Collection|
|objects|open Ascending, loc Ascending|Collection|
|objects|origin Ascending, loc Ascending	|Collection|
|comments|object_id Ascending, created Ascending|Collection|
