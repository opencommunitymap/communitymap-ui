import * as firebase from 'firebase/app';
import prodConf from './.fb-conf-prod';
import devConf from './.fb-conf-dev';

const APP_NAME = '__open_community_map__';
let __initialized = false;

export const initFirebase = (
  config: 'production' | 'development' | Object = 'production'
) => {
  __initialized = true;

  const conf =
    typeof config === 'string'
      ? config === 'production'
        ? prodConf
        : devConf
      : config;
  console.log('Init firebase with', config);
  return firebase.initializeApp(conf, APP_NAME);
};

export const getFirebaseApp = () => {
  if (!__initialized) initFirebase();
  return firebase.app(APP_NAME);
};
