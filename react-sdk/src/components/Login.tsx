import React, { useEffect } from 'react';
import * as firebase from 'firebase/app';
import { getFirebaseApp } from '../utils/firebase';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { Modal } from 'semantic-ui-react';

export const Login: React.FC<{ title?: string; onClose?: () => void }> = ({
  title = 'You need to sign in to continue',
  onClose,
}) => {
  useEffect(() => {
    const uiConfig = {
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
    const ui = new firebaseui.auth.AuthUI(
      getFirebaseApp().auth(),
      getFirebaseApp().name
    );
    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);

    return () => {
      ui.delete();
    };
  }, []);

  return (
    <Modal closeIcon size="mini" open onClose={onClose}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>
        <div style={{ margin: '3em 1.5em' }}>
          <div id="firebaseui-auth-container"></div>
        </div>
      </Modal.Content>
    </Modal>
  );
};
