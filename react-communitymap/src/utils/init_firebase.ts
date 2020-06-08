import * as firebase from 'firebase/app';
import prodConf from './.fb-conf-prod';
import devConf from './.fb-conf-dev';

let __initialized = false;

export default (config: 'production' | 'development' | Object) => {
  if (__initialized) return;
  __initialized = true;

  const conf =
    typeof config === 'string'
      ? config === 'production'
        ? prodConf
        : devConf
      : config;
  console.log('Init firebase with', config);
  firebase.initializeApp(conf);
};
