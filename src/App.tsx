import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { ObjectItem, ObjectItemInput } from './types';
import { SplashScreen } from './components/SplashScreen';
import { Maps, MapItem } from './components/Maps';
import { ChatItem } from './components/Chat';
import { ControlBar } from './components/ControlBar';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') firebase.analytics();

const Home: React.FC<{ user: firebase.User | null }> = ({ user }) => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  const [mapParams, setMapParams] = useState<{
    centerLat: number;
    centerLng: number;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);

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

  return (
    <div className="home">
      <ControlBar authenticated={!!user} onAdd={(item) => postObject(item)} />
      <Maps
        onChange={(centerLat, centerLng, minLat, maxLat, minLng, maxLng) =>
          setMapParams({ centerLat, centerLng, minLat, maxLat, minLng, maxLng })
        }
      >
        {objects.map((it) => (
          <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
            <ChatItem item={it} />
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
