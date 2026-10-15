import React, { useState } from 'react';
import { $config, initializeUI } from '@firebase-oss/ui-core';
import {
  FirebaseUIProvider,
  GoogleSignInButton,
  OAuthScreen,
} from '@firebase-oss/ui-react';
import { getApp } from 'firebase/app';
import { getFirebaseApp } from '../utils/firebase';
import { CommunityDialog } from './CommunityDialog';
import '@firebase-oss/ui-styles/dist.min.css';
import './Login.css';

const returnToCurrentUrl = () => window.location.reload();

export const Login: React.FC<{
  title?: string;
  onClose?: () => void;
  policies?: { termsOfServiceUrl: string; privacyPolicyUrl: string };
}> = ({ title = 'You need to sign in to continue', onClose, policies }) => {
  const [ui] = useState(() => {
    const app = getApp(getFirebaseApp().name);
    // initializeUI replaces stores; reuse the named store on StrictMode/reopen.
    return $config.get()[app.name] || initializeUI({ app }, app.name);
  });

  return (
    <CommunityDialog
      open
      onClose={onClose}
      maxWidth="xs"
      title={title || 'Welcome to your community'}
    >
      <div className="community-login">
        <FirebaseUIProvider ui={ui} policies={policies}>
          <OAuthScreen onSignIn={returnToCurrentUrl}>
            <GoogleSignInButton />
          </OAuthScreen>
        </FirebaseUIProvider>
      </div>
    </CommunityDialog>
  );
};
