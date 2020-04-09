import React, { useState, useEffect } from 'react';
import './App.css';
import { ObjectItem, Coords } from './types';
import { SplashScreen } from './components/SplashScreen';
import { Maps } from './components/Maps';
import { ChatItem } from './components/Chat';
import { ControlBar } from './components/ControlBar';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') firebase.analytics();

const tempAuthor = '123';

const Home = () => {
  const [objects, setObjects] = useState<ObjectItem[]>([]);

  const [mapParams, setMapParams] = useState<{
    center: Coords;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  } | null>(null);
  useEffect(() => {
    if (!mapParams) return;
  });
  return (
    <div className="home">
      <ControlBar
        onAdd={(item) =>
          setObjects([
            ...objects,
            { ...item, author: tempAuthor, loc: mapParams?.center },
          ])
        }
      />
      <Maps
        onChange={(center, minLat, maxLat, minLng, maxLng) =>
          setMapParams({ center, minLat, maxLat, minLng, maxLng })
        }
      >
        {objects.map((it, idx) => (
          <ChatItem key={idx + it.title} lat={it.loc.lat} lng={it.loc.lng}>
            <div>{it.author}</div>
            <div>{it.title}</div>
            <div>{it.description}</div>
          </ChatItem>
        ))}
      </Maps>
    </div>
  );
};

function App() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    setTimeout(() => setSplash(false), 2000);
  }, []);

  if (splash) return <SplashScreen />;

  return <Home />;
}

export default App;
