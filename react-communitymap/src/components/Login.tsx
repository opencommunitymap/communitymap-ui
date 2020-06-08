import React, { useEffect } from 'react';
import * as firebase from 'firebase/app';
import getFirebase from '../utils/firebase';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import './Login.css';

export const Login: React.FC<{ title?: string }> = ({
  title = 'You need to sign in to continue',
}) => {
  useEffect(() => {
    var uiConfig = {
      signInFlow: 'popup',
      // signInSuccessUrl: window.location.origin,
      signInSuccessUrl: window.location.href,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      ],
      // tosUrl and privacyPolicyUrl accept either url string or a callback
      // function.
      // Terms of service url/callback.
      // tosUrl: '<your-tos-url>',
      // Privacy policy url/callback.
      // privacyPolicyUrl: function() {
      //   window.location.assign('<your-privacy-policy-url>');
      // }
    };

    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(getFirebase().auth());
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    return () => ui.reset();
  }, []);

  return (
    <div id="login-container">
      <div className="segment">
        {!!title && <h4>{title}</h4>}
        <div id="firebaseui-auth-container"></div>
      </div>
    </div>
  );
};
