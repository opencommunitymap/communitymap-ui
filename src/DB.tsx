import { useState, useEffect, useMemo } from 'react';
import {
  ObjectItem,
  ObjectComment,
  ObjectVote,
  MapParams,
  ObjectItemInput,
} from './types';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import dayjs from 'dayjs';

export const useLoadObjects = (
  mapParams: any | null,
  user: firebase.User | null
) => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  useEffect(() => {
    if (!mapParams) return;
    const { minLat, maxLat, minLng, maxLng } = mapParams;
    console.debug('Load by', mapParams);

    const now = new Date().toISOString();
    // todo use geofirestore-js as it doesn't filter by longitude right now
    const unsub = firebase
      .firestore()
      .collection('objects')
      // .where('valid_until', '>=', now)
      .where('loc', '>', new firebase.firestore.GeoPoint(minLat, minLng))
      .where('loc', '<', new firebase.firestore.GeoPoint(maxLat, maxLng))
      .onSnapshot((snap) => {
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
  }, [mapParams]);

  const [commentsObj, setCommentsObj] = useState<{
    [k: string]: ObjectComment[];
  } | null>(null);
  const [votesObj, setVotesObj] = useState<{
    [k: string]: { count: number; userVoted: boolean };
  } | null>(null);

  useEffect(() => {
    if (!mapParams) return;

    const objectIds = objects.map((o) => o.id).slice(0, 10); // TODO fix!!!
    console.debug('Load comments for', objectIds);
    if (!objectIds.length) return;

    const unsubComments = firebase
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

    const unsubVotes = firebase
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
  }, [mapParams, objects, user]);

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

    const unsub = firebase
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

    const unsubComments = firebase
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

    const unsubVotes = firebase
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

export const postObject = async (
  user: firebase.User | null,
  mapParams: MapParams | null,
  item: ObjectItemInput
) => {
  if (!user || !mapParams) {
    alert('Temporary cannot post objects. Try again');
    throw new Error('Cannot post object');
  }
  const { centerLat, centerLng } = mapParams;

  const timenow = new Date().toISOString();
  return firebase
    .firestore()
    .collection('objects')
    .add({
      ...item,
      author: user!.uid,
      created: timenow,
      updated: timenow,
      loc: new firebase.firestore.GeoPoint(centerLat, centerLng),
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
  return firebase.firestore().collection('objects').doc(item.id!).update({
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
  return firebase.firestore().collection('votes').add({
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
  return firebase.firestore().collection('comments').add({
    object_id: item.id,
    author: user.uid,
    comment,
    created: timenow,
  });
};
