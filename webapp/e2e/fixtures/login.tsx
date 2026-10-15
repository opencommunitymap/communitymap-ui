import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, CssBaseline } from '@mui/material';
import { $config } from '@firebase-oss/ui-core';
import { FirebaseError, getApps } from 'firebase/app';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import {
  AuthProvider,
  CommunityMapTheme,
  initFirebase,
  Login as SdkLogin,
  useAuth,
} from '@opencommunitymap/react-sdk';
import { Login as WebappLogin } from '../../src/components/Login';

const params = new URLSearchParams(window.location.search);
const localAuth = params.has('localAuth');
const app = initFirebase(
  localAuth
    ? {
        apiKey: 'local-e2e-key',
        authDomain: 'demo-community-map.firebaseapp.com',
        projectId: 'demo-community-map',
      }
    : 'development'
);
if (localAuth) {
  app.auth().useEmulator('http://127.0.0.1:9099');
}

const Login =
  params.get('source') === 'sdk'
    ? SdkLogin
    : WebappLogin;

let signInAttempts = 0;

const LoginFixture: React.FC = () => {
  const [open, setOpen] = useState(false);
  const user = useAuth();

  useEffect(() => {
    if (!open || !localAuth) return;
    // Replace only the external popup boundary. The real UI, named Auth instance,
    // credential exchange, persistence, and compat subscription still run.
    const store = $config.get()[app.name];
    store.setKey('behaviors', {
      ...store.get().behaviors,
      providerSignInStrategy: {
        type: 'callable',
        handler: async (ui) => {
          if (++signInAttempts === 1) {
            throw new FirebaseError('auth/popup-closed-by-user', 'Popup closed');
          }
          return signInWithCredential(
            ui.auth,
            GoogleAuthProvider.credential('local-google-token')
          );
        },
      },
    });
  }, [open]);

  return (
    <CommunityMapTheme>
      <CssBaseline />
      <Button onClick={() => setOpen(true)}>Open sign-in</Button>
      {localAuth && (
        <>
          <output aria-label="Auth user">
            {user === undefined ? 'loading' : user?.uid || 'signed out'}
          </output>
          <output aria-label="Firebase apps">
            {getApps().map((item) => item.name).join(',')}
          </output>
          <Button onClick={() => app.auth().signOut()}>
            Sign out through compat
          </Button>
        </>
      )}
      {open && (
        <Login
          onClose={() => setOpen(false)}
          {...(params.has('policies') && {
            policies: {
              termsOfServiceUrl: 'https://example.com/community-terms',
              privacyPolicyUrl: 'https://example.com/community-privacy',
            },
          })}
        />
      )}
    </CommunityMapTheme>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LoginFixture />
    </AuthProvider>
  </React.StrictMode>
);
