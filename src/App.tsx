import React, { useState, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import { MapParams } from './types';
import { SplashScreen } from './components/SplashScreen';
import { Maps, MapItem } from './components/Maps';
import { ChatItem } from './components/Chat';
import { ControlBar, AuthBar, NavigationBar } from './components/ControlBar';
import {
  useLoadObjects,
  postObject,
  leaveComment,
  voteUp,
  closeObject,
} from './DB';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { Segment } from 'semantic-ui-react';

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') firebase.analytics();

const Home: React.FC<{ user: firebase.User | null }> = ({ user }) => {
  const [mapParams, setMapParams] = useState<MapParams | null>(null);

  const { objects, commentsObj, votesObj } = useLoadObjects(mapParams, user);


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
                  user={user}
                  userVoted={votesObj[it.id]?.userVoted}
                  votes={votesObj[it.id]?.count}
                  comments={commentsObj[it.id]}
                  onComment={async (comment) => leaveComment(user, it, comment)}
                  onVote={async () => voteUp(user, it)}
                  onClose={async () => closeObject(user, it)}
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
