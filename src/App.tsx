import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import {
  ObjectItem,
  ObjectItemInput,
  ObjectComment,
  ObjectVote,
} from './types';
import { SplashScreen } from './components/SplashScreen';
import { Maps, MapItem } from './components/Maps';
import { ChatItem } from './components/Chat';
import { ControlBar, AuthBar, NavigationBar } from './components/ControlBar';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { Segment } from 'semantic-ui-react';

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') firebase.analytics();

const useLoadObjects = (mapParams: any | null, user: firebase.User | null) => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  useEffect(() => {
    if (!mapParams) return;
    const { minLat, maxLat, minLng, maxLng } = mapParams;
    console.debug('Load by', mapParams);

    // todo use geofirestore-js as it doesn't filter by longitude right now
    const unsub = firebase
      .firestore()
      .collection('objects')
      .where('loc', '>', new firebase.firestore.GeoPoint(minLat, minLng))
      .where('loc', '<', new firebase.firestore.GeoPoint(maxLat, maxLng))
      .onSnapshot((snap) => {
        const objs = snap.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as ObjectItem)
        );
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

    const objectIds = objects.map((o) => o.id);
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

const Home: React.FC<{ user: firebase.User | null }> = ({ user }) => {
  const [mapParams, setMapParams] = useState<{
    centerLat: number;
    centerLng: number;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

  const { objects, commentsObj, votesObj } = useLoadObjects(mapParams, user);

  const postObject = useCallback(
    async (item: ObjectItemInput) => {
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
    },
    [mapParams, user]
  );

  const voteUp = useCallback(
    async (item: ObjectItem) => {
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
    },
    [user]
  );

  const leaveComment = useCallback(
    async (item: ObjectItem, comment: string) => {
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
    },
    [user]
  );

  return (
    <div className="home">
      <ControlBar authenticated={!!user} onAdd={(item) => postObject(item)} />
      <AuthBar user={user} />
      <NavigationBar
        onChangePosition={(lat, lng) => {
          console.log('located', lat, lng);
          setMapParams({
            ...(mapParams || { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }),
            centerLat: lat,
            centerLng: lng,
          });
        }}
      />
      <Maps
        centerLat={mapParams?.centerLat}
        centerLng={mapParams?.centerLng}
        onChange={(centerLat, centerLng, minLat, maxLat, minLng, maxLng) =>
          setMapParams({ centerLat, centerLng, minLat, maxLat, minLng, maxLng })
        }
      >
        {commentsObj &&
          votesObj &&
          objects.map((it) => (
            <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
              <Segment raised className="map-item left pointing label">
                <ChatItem
                  item={it}
                  authenticated={!!user}
                  userVoted={votesObj[it.id]?.userVoted}
                  votes={votesObj[it.id]?.count}
                  comments={commentsObj[it.id]}
                  onComment={async (comment) => leaveComment(it, comment)}
                  onVote={async () => voteUp(it)}
                />
              </Segment>
            </MapItem>
          ))}
      </Maps>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<firebase.User | null | undefined>();

  useEffect(() => {
    return firebase.auth().onIdTokenChanged((user) => {
      console.debug('Loaded user', user);
      setUser(user);
    });
  }, []);

  const [splash, setSplash] = useState(true);
  useEffect(() => {
    setTimeout(() => setSplash(false), 2000);
  }, []);
  if (splash || user === undefined) return <SplashScreen />;

  return <Home user={user} />;
}

export default App;
