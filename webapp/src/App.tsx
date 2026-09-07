import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  useRouteMatch,
  Link,
} from 'react-router-dom';
import queryString from 'query-string';
import './App.css';

import {
  SplashScreen,
  ProfileWidgetPlus,
  UserPage,
  NewContentWidget,
  DirectMessageModal,
  DirectMessageDialogs,
  TermsOfService,
  PrivacyPolicy,
  CookieConsentBanner,
} from './components';
import {
  CommunityMap,
  Pin,
  useAuth,
  AuthProvider,
  RenderAuthorCallback,
  OPEN_FREE_MAP_STYLES,
  postObject,
  initFirebase,
  CommunityMapTheme,
  CommunityDialog,
} from '@opencommunitymap/react-sdk';
import { InitialAppParams, EmbedParams } from './types';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import { CssBaseline, Paper, Typography } from '@mui/material';
import PublicRounded from '@mui/icons-material/PublicRounded';

const OCM_ENV = process.env.REACT_APP_OCM_ENV || process.env.NODE_ENV;

const __initFirebase = async () => {
  return initFirebase(OCM_ENV);
  // if (process.env.NODE_ENV === 'production') {
  //   return fetch('/__/firebase/init.json').then(async (response) => {
  //     console.debug('Init firebase with default project config');
  //     firebase.initializeApp(await response.json());
  //   });
  // } else {
  //   const { firebaseConfig } = require('./firebaseConfig');
  //   console.debug('Init firebase with local config', firebaseConfig);
  //   firebase.initializeApp(firebaseConfig);
  // }
};

const FirebaseInitializer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    __initFirebase()
      .then((firebase) => {
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

const defaultCenter =
  typeof initialParams?.centerLat === 'number' &&
  typeof initialParams?.centerLng === 'number'
    ? {
        latitude: initialParams.centerLat,
        longitude: initialParams.centerLng,
      }
    : { latitude: 42.69, longitude: 23.32 };

const mapStyle = OPEN_FREE_MAP_STYLES[initialParams?.theme || 'standard'];

const renderAuthor: RenderAuthorCallback = (userId, authorInfo) => (
  <Link to={`/users/${userId}`}>{authorInfo?.name || 'Anonymous'}</Link>
);

const Home: React.FC = () => {
  const user = useAuth() || null;
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const router = useHistory();

  const objectRouteMatch = useRouteMatch<{ objectId: string }>(
    '/object/:objectId'
  );

  return (
    <div id="home">
      <Paper component="header" className="map-brand">
        <span className="brand-mark">
          <PublicRounded />
        </span>
        <div>
          <Typography
            component="h1"
            variant="subtitle1"
            sx={{ fontWeight: 750, lineHeight: 1.2 }}
          >
            Open Community Map
          </Typography>
          <Typography
            className="brand-tagline"
            variant="caption"
            color="text.secondary"
          >
            A little closer to your community
          </Typography>
        </div>
      </Paper>
      <CommunityMap
        defaultCenter={defaultCenter}
        mapStyle={mapStyle}
        onChange={(center) => setCurrentLocation(center)}
        showObjectId={objectRouteMatch?.params?.objectId}
        onClickObject={(obj) => {
          router.push(`/object/${obj.id}`);
          return true;
        }}
        onObjectModalClose={() => router.push('/')}
        centerPin={<Pin color="#147d70" />}
        autolocate={initialParams?.autolocate}
        filterOrigin={initialParams?.filterOrigin}
        profileWidget={<ProfileWidgetPlus />}
        renderAuthor={renderAuthor}
        // renderObject={({ item }) => (item.type === 'story' ? true : null)}
      ></CommunityMap>
      {initialParams?.canAdd !== false && (
        <NewContentWidget
          authenticated={!!user}
          onAdd={(item) =>
            postObject(user, currentLocation, item, embedParams?.appId)
          }
        />
      )}

      <Switch>
        <Route path="/direct-messages/:dmKey">
          <DirectMessageModal onClose={() => router.push('/')} />
        </Route>
        <Route path="/users/:userId">
          <CommunityDialog
            open
            onClose={() => router.push('/')}
            title="Community profile"
          >
            <UserPage />
          </CommunityDialog>
        </Route>
        <Route path="/my-messages">
          <CommunityDialog
            open
            onClose={() => router.push('/')}
            maxWidth="sm"
            title="Messages"
          >
            <DirectMessageDialogs />
          </CommunityDialog>
        </Route>
        <Route path="/terms">
          <CommunityDialog
            open
            onClose={() => router.push('/')}
            maxWidth="lg"
            title="Terms of Service"
          >
            <TermsOfService />
          </CommunityDialog>
        </Route>
        <Route path="/privacy">
          <CommunityDialog
            open
            onClose={() => router.push('/')}
            maxWidth="lg"
            title="Privacy and Cookie Policy"
          >
            <PrivacyPolicy />
          </CommunityDialog>
        </Route>
      </Switch>
    </div>
  );
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
  <CommunityMapTheme>
    <CssBaseline />
    <FirebaseInitializer>
      <AuthProvider>
        <Router basename={isEmbed ? embedBasename : undefined}>
          <App />
          <CookieConsentBanner />
        </Router>
      </AuthProvider>
    </FirebaseInitializer>
  </CommunityMapTheme>
);
