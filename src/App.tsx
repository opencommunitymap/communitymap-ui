import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useParams,
} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import { MapParams } from './types';
import { SplashScreen } from './components/SplashScreen';
import { Maps, MapItem } from './components/Maps';
import { ChatItem } from './components/Chat';
import { UserPage } from './components/UserPage';
import { ControlBar, AuthBar, NavigationBar } from './components/ControlBar';
import {
  useLoadObjects,
  postObject,
  leaveComment,
  voteUp,
  closeObject,
  useLoadSingleObject,
} from './DB';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';
import { Segment, Modal, Loader } from 'semantic-ui-react';

firebase.initializeApp(firebaseConfig);

if (process.env.NODE_ENV === 'production') firebase.analytics();

const DetailedObjectRender: React.FC<{ user: firebase.User | null }> = ({
  user,
}) => {
  const { objectId = 'n/a' } = useParams();

  const { object, comments, votesInfo } = useLoadSingleObject(objectId, user);

  return (
    <div>
      {object === undefined && <Loader active />}
      {object === null && <div>Object not found :(</div>}
      {!!object && (
        <ChatItem
          expanded
          item={object}
          user={user}
          userVoted={votesInfo?.userVoted || false}
          votes={votesInfo?.count || 0}
          comments={comments || []}
          onComment={async (comment) => leaveComment(user, object, comment)}
          onVote={async () => voteUp(user, object)}
          onClose={async () => closeObject(user, object)}
        />
      )}
    </div>
  );
};

const Home: React.FC<{ user: firebase.User | null }> = ({ user }) => {
  const [mapParams, setMapParams] = useState<MapParams | null>(null);

  const { objects, commentsObj, votesObj } = useLoadObjects(mapParams, user);

  const router = useHistory();

  return (
    <div className="home">
      <ControlBar
        authenticated={!!user}
        onAdd={(item) => postObject(user, mapParams, item)}
      />
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
          setMapParams({
            centerLat,
            centerLng,
            minLat,
            maxLat,
            minLng,
            maxLng,
          })
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
                  onClick={() => router.push(`/object/${it.id}`)}
                  onComment={async (comment) => leaveComment(user, it, comment)}
                  onVote={async () => voteUp(user, it)}
                  onClose={async () => closeObject(user, it)}
                />
              </Segment>
            </MapItem>
          ))}
      </Maps>
      <Switch>
        <Route path="/object/:objectId">
          <Modal open closeIcon size="tiny" onClose={() => router.push('/')}>
            <Modal.Content scrolling>
              <DetailedObjectRender user={user} />
            </Modal.Content>
          </Modal>
        </Route>
        <Route path="/users/:userId">
          <Modal open closeIcon size="tiny" onClose={() => router.push('/')}>
            <Modal.Content scrolling>
              <UserPage />
            </Modal.Content>
          </Modal>
        </Route>
      </Switch>
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

export default () => (
  <Router>
    <App />
  </Router>
);
