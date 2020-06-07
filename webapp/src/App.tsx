import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useParams,
} from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
import queryString from 'query-string';
import './App.css';

import {
  SplashScreen,
  UserPage,
  NewContentWidget,
  ProfileWidget,
  NavigationWidget,
  DirectMessageModal,
  DirectMessageDialogs,
} from './components';
import {
  PointingSegment,
  CommunityMap,
  Pin,
  useLoadObjects,
  postObject,
  leaveComment,
  voteUp,
  closeObject,
  useLoadSingleObject,
  ObjectItem,
  ObjectComment,
  ObjectItemComponentProps,
  useAuth,
  AuthProvider,
  Loc,
  MapParams,
  detectLocation,
  Place,
  Story,
  Chat,
} from 'react-communitymap';
import { InitialAppParams, EmbedParams } from './types';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { Modal, Loader } from 'semantic-ui-react';
// import { useAuth, AuthProvider } from './Auth';

const initFirebase = async () => {
  if (process.env.NODE_ENV === 'production') {
    return fetch('/__/firebase/init.json').then(async (response) => {
      console.debug('Init firebase with default project config');
      firebase.initializeApp(await response.json());
    });
  } else {
    const { firebaseConfig } = require('./firebaseConfig');
    console.debug('Init firebase with local config', firebaseConfig);
    firebase.initializeApp(firebaseConfig);
  }
};

const FirebaseInitializer: React.FC = ({ children }) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    initFirebase()
      .then(() => {
        if (process.env.NODE_ENV === 'production') {
          firebase.analytics();
        }
        setDone(true);
      })
      .catch((err) => alert(err.message));
  }, []);

  return done ? <>{children}</> : <SplashScreen showLogo={false} />;
};

const embedBasename = '/embed';
const isEmbed = window.location.pathname.indexOf(embedBasename) === 0;
const initialParams: InitialAppParams | null = window.location.search
  ? (queryString.parse(window.location.search, {
      parseNumbers: true,
      parseBooleans: true,
    }) as any)
  : null;
const embedParams: EmbedParams | null = isEmbed
  ? {
      appId: initialParams?.appId as string,
    }
  : null;

const MapObjectRender: React.FC<{
  item: ObjectItem;
  comments?: ObjectComment[];
  votesInfo: { count: number; userVoted: boolean };
}> = ({ item, votesInfo, comments }) => {
  const user = useAuth() || null;
  const router = useHistory();

  let RealComponent: React.FC<ObjectItemComponentProps>;

  switch (item.type) {
    case 'place':
      RealComponent = Place;
      break;
    case 'story':
      RealComponent = Story;
      break;
    default:
      RealComponent = Chat;
  }
  return (
    <RealComponent
      item={item}
      user={user}
      userVoted={votesInfo?.userVoted}
      votes={votesInfo?.count}
      comments={comments}
      onClick={() => router.push(`/object/${item.id}`)}
      onComment={async (comment) => leaveComment(user, item, comment)}
      onVote={async () => voteUp(user, item)}
      onClose={async () => closeObject(user, item)}
    />
  );
};

const DetailedObjectRender: React.FC = () => {
  const user = useAuth() || null;
  const { objectId = 'n/a' } = useParams();

  const { object, comments, votesInfo } = useLoadSingleObject(objectId, user);

  if (object === undefined) return <Loader active />;
  if (object === null) return <div>Object not found :(</div>;

  let RealComponent: React.FC<ObjectItemComponentProps>;

  switch (object.type) {
    case 'place':
      RealComponent = Place;
      break;
    case 'story':
      RealComponent = Story;
      break;
    default:
      RealComponent = Chat;
  }

  return (
    <RealComponent
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
  );
};

const defaultCenter = { latitude: 42.69, longitude: 23.32 };

const Home: React.FC = () => {
  // const user = useAuth() || null;
  // const [mapParams, setMapParams] = useState<MapParams | null>(null);

  // const setMapCenter = useCallback(
  //   (center: Loc) => {
  //     setMapParams((mapParams) =>
  //       mapParams
  //         ? { ...mapParams, center }
  //         : { center, bounds: { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 } }
  //     );
  //     // ({
  //     //   ...(mapParams || { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 }),
  //     //   centerLat: lat,
  //     //   centerLng: lng,
  //     // }));
  //   },
  //   [setMapParams]
  // );

  // useEffect(() => {
  //   if (initialParams?.autolocate) {
  //     detectLocation()
  //       .then((loc) => {
  //         console.debug('Autolocate:', loc);
  //         setMapCenter(loc);
  //       })
  //       .catch((err) => {
  //         console.log('Error autodetecting location:', err);
  //         // silently ignore for the moment
  //       });
  //   }
  // }, [setMapCenter]);

  // const { objects, commentsObj, votesObj } = useLoadObjects(
  //   mapParams?.bounds || null,
  //   user,
  //   initialParams?.filterOrigin
  // );

  const router = useHistory();

  return (
    <div id="home">
      <CommunityMap
        centerPin={<Pin />}
        center={defaultCenter}
        renderObject={({ item }) => (item.type === 'story' ? true : null)}
      ></CommunityMap>
    </div>
  );

  // return (
  //   <div id="home">
  //     {initialParams?.canAdd !== false && (
  //       <NewContentWidget
  //         authenticated={!!user}
  //         onAdd={(item) =>
  //           postObject(user, mapParams, item, embedParams?.appId)
  //         }
  //       />
  //     )}
  //     <ProfileWidget />
  //     <NavigationWidget
  //       onChangePosition={(lat, lng) => {
  //         console.debug('located', lat, lng);
  //         setMapCenter(lat, lng);
  //       }}
  //     />
  //     <Maps
  //       theme={initialParams?.theme}
  //       centerLat={mapParams?.centerLat || initialParams?.centerLat}
  //       centerLng={mapParams?.centerLng || initialParams?.centerLng}
  //       onChange={(centerLat, centerLng, minLat, maxLat, minLng, maxLng) =>
  //         setMapParams({
  //           centerLat,
  //           centerLng,
  //           minLat,
  //           maxLat,
  //           minLng,
  //           maxLng,
  //         })
  //       }
  //     >
  //       {commentsObj &&
  //         votesObj &&
  //         objects.map((it) => (
  //           <MapItem key={it.id} lat={it.loc.latitude} lng={it.loc.longitude}>
  //             <PointingSegment>
  //               <MapObjectRender
  //                 item={it}
  //                 votesInfo={votesObj[it.id]}
  //                 comments={commentsObj[it.id]}
  //               />
  //             </PointingSegment>
  //           </MapItem>
  //         ))}
  //     </Maps>
  //     <Switch>
  //       <Route path="/object/:objectId">
  //         <Modal open closeIcon size="tiny" onClose={() => router.push('/')}>
  //           <Modal.Content scrolling>
  //             <DetailedObjectRender />
  //           </Modal.Content>
  //         </Modal>
  //       </Route>
  //       <Route path="/users/:userId">
  //         <Modal open closeIcon size="tiny" onClose={() => router.push('/')}>
  //           <Modal.Content scrolling>
  //             <UserPage />
  //           </Modal.Content>
  //         </Modal>
  //       </Route>
  //       <Route path="/direct-messages/:dmKey">
  //         <DirectMessageModal onClose={() => router.push('/')} />
  //       </Route>
  //       <Route path="/my-messages">
  //         <Modal open closeIcon size="tiny" onClose={() => router.push('/')}>
  //           <Modal.Header>Messages</Modal.Header>
  //           <Modal.Content scrolling>
  //             <DirectMessageDialogs />
  //           </Modal.Content>
  //         </Modal>
  //       </Route>
  //     </Switch>
  //   </div>
  // );
};

function App() {
  const user = useAuth();

  const [splash, setSplash] = useState(!isEmbed ? true : false);
  useEffect(() => {
    setTimeout(() => setSplash(false), 2000);
  }, []);

  if (isEmbed) {
    if (!embedParams?.appId)
      return (
        <div>
          Mandatory parameter <strong>appId</strong> is missing. Read
          https://github.com/opencommunitymap/communitymap-ui#embedding for more
          information
        </div>
      );
  }

  if (splash || user === undefined) return <SplashScreen />;

  return <Home />;
}

export default () => (
  <FirebaseInitializer>
    <AuthProvider>
      <Router basename={isEmbed ? embedBasename : undefined}>
        <App />
      </Router>
    </AuthProvider>
  </FirebaseInitializer>
);
