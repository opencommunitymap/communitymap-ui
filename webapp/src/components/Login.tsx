import React, { useEffect, useRef } from 'react';
import firebase from 'firebase/app';
import { getFirebaseApp } from '@opencommunitymap/react-sdk';
import 'firebase/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import { CommunityDialog } from '@opencommunitymap/react-sdk';

const SignInWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
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
      tosUrl: window.location.origin + '/terms',
      // Privacy policy url/callback.
      privacyPolicyUrl: window.location.origin + '/privacy',
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
    ui.start(container.current!, uiConfig);

    return () => {
      ui.delete();
    };
  }, []);

  return <div ref={container} />;
};

export const Login: React.FC<{ title?: string; onClose?: () => void }> = ({
  title = 'You need to sign in to continue',
  onClose,
}) => (
  <CommunityDialog
    open
    onClose={onClose}
    maxWidth="xs"
    title={title || 'Welcome to your community'}
  >
    <div style={{ margin: '24px 0' }}>
      <SignInWidget />
    </div>
  </CommunityDialog>
);
