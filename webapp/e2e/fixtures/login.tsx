import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, CssBaseline } from '@mui/material';
import {
  CommunityMapTheme,
  initFirebase,
  Login as SdkLogin,
} from '@opencommunitymap/react-sdk';
import { Login as WebappLogin } from '../../src/components/Login';

initFirebase('development');

const Login =
  new URLSearchParams(window.location.search).get('source') === 'sdk'
    ? SdkLogin
    : WebappLogin;

const LoginFixture: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <CommunityMapTheme>
      <CssBaseline />
      <Button onClick={() => setOpen(true)}>Open sign-in</Button>
      {open && <Login onClose={() => setOpen(false)} />}
    </CommunityMapTheme>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LoginFixture />
  </React.StrictMode>
);
