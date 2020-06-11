import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ObjectItem,
  ObjectComment,
  ObjectVote,
  ObjectItemInput,
  UserProfile,
  DirectMessageInfo,
  DirectMessageItem,
  MapBounds,
  Loc,
} from '../';
import * as firebase from 'firebase/app';
import { getFirebaseApp } from '../utils/firebase';
import 'firebase/auth';
import 'firebase/firestore';
import dayjs from 'dayjs';
import { useAuth } from './Auth';

export const useLoadObjects = (
  mapBounds: MapBounds | null,
  user: firebase.User | null,
  filterOrigin?: string
) => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  useEffect(() => {
    if (!mapBounds) return;
    const { minLat, maxLat, minLng, maxLng } = mapBounds;
    console.debug('Load by', mapBounds);

    const now = new Date().toISOString();
    // todo use geofirestore-js as it doesn't filter by longitude right now
    let ref = getFirebaseApp()
      .firestore()
      .collection('objects')
      // .where('valid_until', '>=', now)
      .where('loc', '>', new firebase.firestore.GeoPoint(minLat, minLng))
      .where('loc', '<', new firebase.firestore.GeoPoint(maxLat, maxLng));

    if (filterOrigin) {
      ref = ref.where('origin', '==', filterOrigin);
    }

    const unsub = ref.onSnapshot((snap) => {
      const objs = snap.docs
        .filter((doc) => {
          const valid_until = doc.data()?.valid_until;
          return !!valid_until && valid_until >= now;
        })
        .map((doc) => ({ id: doc.id, ...doc.data() } as ObjectItem));
      console.debug('Loaded objects', objs);
      setObjects(objs);
    });
    return unsub;
  }, [mapBounds, filterOrigin]);

  const [commentsObj, setCommentsObj] = useState<{
    [k: string]: ObjectComment[];
  } | null>(null);
  const [votesObj, setVotesObj] = useState<{
    [k: string]: { count: number; userVoted: boolean };
  } | null>(null);

  useEffect(() => {
    if (!mapBounds) return;

    const objectIds = objects.map((o) => o.id).slice(0, 10); // TODO fix!!!
    console.debug('Load comments for', objectIds);
    if (!objectIds.length) return;

    const unsubComments = getFirebaseApp()
      .firestore()
      .collection('comments')
      .where('object_id', 'in', objectIds)
      .onSnapshot((snap) => {
        const objs: { [k: string]: ObjectComment[] } = {};
        snap.forEach((doc) => {
          const comment = doc.data() as ObjectComment;
          comment.id = doc.id;
          const objComms = objs[comment.object_id] || [];
          objComms.push(comment);
          objs[comment.object_id] = objComms;
        });
        console.debug('Loaded comments', objs);
        setCommentsObj(objs);
      });

    const unsubVotes = getFirebaseApp()
      .firestore()
      .collection('votes')
      .where('object_id', 'in', objectIds)
      .onSnapshot((snap) => {
        const objs: { [k: string]: { count: number; userVoted: boolean } } = {};
        snap.forEach((doc) => {
          const vote = doc.data() as ObjectVote;
          const objectVotingInfo = objs[vote.object_id] || {
            count: 0,
            userVoted: false,
          };
          objectVotingInfo.count += vote.value;
          if (user?.uid === vote.author) {
            objectVotingInfo.userVoted = true;
          }
          objs[vote.object_id] = objectVotingInfo;
        });
        console.debug('Loaded votes', objs);
        setVotesObj(objs);
      });
    return () => {
      unsubComments();
      unsubVotes();
    };
  }, [mapBounds, objects, user]);

  const data = useMemo(() => ({ objects, commentsObj, votesObj }), [
    objects,
    commentsObj,
    votesObj,
  ]);
  return data;
};

export const useLoadSingleObject = (id: string, user: firebase.User | null) => {
  const [object, setObject] = useState<ObjectItem | null | undefined>();
  const [comments, setComments] = useState<ObjectComment[] | null>(null);
  const [votesInfo, setVotesInfo] = useState<{
    count: number;
    userVoted: boolean;
  } | null>(null);

  useEffect(() => {
    console.debug('Load by id', id);

    const unsub = getFirebaseApp()
      .firestore()
      .collection('objects')
      .doc(id)
      .onSnapshot((doc) => {
        if (!doc.exists) {
          setObject(null);
          console.log('object not found');
          return;
        }
        const objectInfo = { id: doc.id, ...doc.data() } as ObjectItem;
        console.debug('Loaded objects', objectInfo);
        setObject(objectInfo);
      });
    return unsub;
  }, [id]);

  useEffect(() => {
    console.debug('Load comments for', id);

    const unsubComments = getFirebaseApp()
      .firestore()
      .collection('comments')
      .where('object_id', '==', id)
      .orderBy('created')
      .onSnapshot((snap) => {
        const comms: ObjectComment[] = snap.docs.map((doc) => {
          return { id: doc.id, ...doc.data() } as ObjectComment;
        });
        console.debug('Loaded comments', comms);
        setComments(comms);
      });

    const unsubVotes = getFirebaseApp()
      .firestore()
      .collection('votes')
      .where('object_id', '==', id)
      .onSnapshot((snap) => {
        const objectVotingInfo = {
          count: 0,
          userVoted: false,
        };
        snap.forEach((doc) => {
          const vote = doc.data() as ObjectVote;
          objectVotingInfo.count += vote.value;
          if (user?.uid === vote.author) {
            objectVotingInfo.userVoted = true;
          }
        });
        console.debug('Loaded votes', objectVotingInfo);
        setVotesInfo(objectVotingInfo);
      });
    return () => {
      unsubComments();
      unsubVotes();
    };
  }, [id, user]);

  const data = useMemo(() => ({ object, comments, votesInfo }), [
    object,
    comments,
    votesInfo,
  ]);
  return data;
};

export const useAsyncStatus = (cb: () => Promise<any>) => {
  const [status, setStatus] = useState({
    pending: false,
    success: false,
    error: '',
  });
  const ref = useRef(cb);
  ref.current = cb;

  const func = useCallback(
    (...args: any) => {
      setStatus({ ...status, pending: true, error: '' });
      ref
        .current()
        .then((res) => {
          setStatus({ ...status, pending: false, success: true });
          return res;
        })
        .catch((err) => {
          setStatus({ ...status, pending: false, error: err.toString() });
        });
    },
    [status]
  );

  return useMemo(() => ({ status, func }), [status, func]);
};

export const postObject = async (
  user: firebase.User | null,
  loc: Loc | null,
  item: ObjectItemInput,
  origin?: string
) => {
  if (!user || !loc) {
    alert('Temporary cannot post objects. Try again');
    throw new Error('Cannot post object');
  }

  const timenow = new Date().toISOString();
  return getFirebaseApp()
    .firestore()
    .collection('objects')
    .add({
      ...item,
      author: user!.uid,
      origin: origin || null,
      created: timenow,
      updated: timenow,
      loc: new firebase.firestore.GeoPoint(loc.latitude, loc.longitude),
    });
};

export const closeObject = async (
  user: firebase.User | null,
  item: ObjectItem
) => {
  if (!user) {
    alert('Temporary cannot close objects. Try again');
    throw new Error('Cannot close object');
  }
  const timenow = new Date().toISOString();
  return getFirebaseApp()
    .firestore()
    .collection('objects')
    .doc(item.id!)
    .update({
      valid_until: dayjs().toISOString(),
      updated: timenow,
    });
};

export const voteUp = async (user: firebase.User | null, item: ObjectItem) => {
  if (!user) {
    alert('You need to register or sign in');
    throw new Error('Cannot vote');
  }

  const timenow = new Date().toISOString();
  return getFirebaseApp().firestore().collection('votes').add({
    object_id: item.id,
    author: user.uid,
    value: 1,
    created: timenow,
  });
};

export const leaveComment = async (
  user: firebase.User | null,
  item: ObjectItem,
  comment: string
) => {
  if (!user) {
    alert('You need to register or sign in');
    throw new Error('Cannot vote');
  }

  const timenow = new Date().toISOString();
  return getFirebaseApp().firestore().collection('comments').add({
    object_id: item.id,
    author: user.uid,
    comment,
    created: timenow,
  });
};

export const useUserPublicInfo = (userId: string, subscribe = false) => {
  const [object, setObject] = useState<UserProfile | null | undefined>();

  useEffect(() => {
    console.debug('Load user id', userId);
    const ref = getFirebaseApp()
      .firestore()
      .collection('users-public')
      .doc(userId);
    if (subscribe) {
      const unsub = ref.onSnapshot((doc) => {
        if (!doc.exists) {
          setObject(null);
          console.log('user not found');
          return;
        }
        const objectInfo = { id: doc.id, ...doc.data() } as UserProfile;
        console.debug('Loaded objects', objectInfo);
        setObject(objectInfo);
      });
      return unsub;
    }

    ref.get().then((doc) => {
      const objectInfo = { id: doc.id, ...doc.data() } as UserProfile;
      console.debug('Resolved once', objectInfo);
      setObject(objectInfo);
    });
  }, [userId, subscribe]);

  return object;
};

export const saveUserPublicInfo = async (userInfo: UserProfile) => {
  const { id, ...data } = userInfo;

  const timenow = new Date().toISOString();
  return getFirebaseApp()
    .firestore()
    .collection('users-public')
    .doc(id)
    .set({
      ...data,
      created: data.created || timenow,
      updated: timenow,
    });
};

export const useDirectMessage = (dialogId: string) => {
  const [dialogInfo, setDialogInfo] = useState<
    undefined | null | DirectMessageInfo
  >();
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);

  const ref = useMemo(
    () =>
      getFirebaseApp().firestore().collection('direct-messages').doc(dialogId),
    [dialogId]
  );
  const me = useAuth();

  const postMessage = useCallback(
    async (message: string) => {
      if (!me) throw new Error('Not authenticated');

      if (!dialogInfo) {
        const members = dialogId.split('-');
        await ref.set({
          members,
          created: new Date().toISOString(),
        });
      }

      const timestamp = new Date().toISOString();
      const msgDoc = await ref.collection('dm-items').add({
        timestamp,
        author: me?.uid,
        content: message,
      });

      return ref.update({
        updated: timestamp,
        lastMsgId: msgDoc.id,
        [`lastReadBy.${me.uid}`]: msgDoc.id,
      });
    },
    [dialogInfo, dialogId, ref, me]
  );

  const updateLastMessageReadByMe = useCallback(async () => {
    if (!me) throw new Error('Not authenticated');

    if (!dialogInfo) {
      return;
    }

    return ref.update({
      [`lastReadBy.${me.uid}`]: dialogInfo.lastMsgId,
    });
  }, [dialogInfo, ref, me]);

  useEffect(
    () =>
      ref.onSnapshot(
        (doc) => {
          if (!doc.exists) {
            setDialogInfo(null);
            return;
          }
          setDialogInfo({ id: dialogId, ...doc.data() } as DirectMessageInfo);
        },
        (err) => console.log('Error loading dm-items', err)
      ),
    [ref, dialogId]
  );

  const [retryCounter, setRetryCounter] = useState(0);
  useEffect(() => {
    if (!dialogInfo) return;

    return ref
      .collection('dm-items')
      .orderBy('timestamp')
      .onSnapshot(
        (snap) => {
          const msgs: DirectMessageItem[] = snap.docs.map((doc) => {
            const { timestamp, author, content } = doc.data();
            return { id: doc.id, timestamp, author, content };
          });
          setMessages(msgs);
        },
        (err) => {
          // It can happen when sending first message, we create the info structure then post message to its subcollection
          // First attempt (right after info creation) fails
          if (retryCounter > 1) console.error(err);
          console.debug('Cannot load dm-items, retry in 1 sec');
          setTimeout(() => setRetryCounter((count) => count + 1), 1000);
        }
      );
  }, [ref, dialogId, dialogInfo, retryCounter]);

  return { info: dialogInfo, messages, postMessage, updateLastMessageReadByMe };
};

export const useMyDirectMessages = () => {
  const [dialogs, setDialogs] = useState<DirectMessageInfo[] | null>(null);

  const me = useAuth();

  useEffect(() => {
    if (!me) return;

    return getFirebaseApp()
      .firestore()
      .collection('direct-messages')
      .where('members', 'array-contains', me.uid)
      .orderBy('updated', 'desc')
      .onSnapshot((snap) => {
        setDialogs(
          snap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as DirectMessageInfo;
          })
        );
      }, console.error);
  }, [me]);
  return { dialogs };
};
