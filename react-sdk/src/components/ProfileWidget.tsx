import React, { useState, useEffect } from 'react';
import { getFirebaseApp } from '../utils/firebase';
import { useAuth, Login } from '..';
import {
  Menu,
  MenuItem,
  Button,
  IconButton,
  Divider,
  ListItemIcon,
} from '@mui/material';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import './commonStyles.css';

export const ProfileWidget: React.FC = () => {
  const user = useAuth();
  const [login, setLogin] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (user && login) setLogin(false);
  }, [user, login]);

  return (
    <div id="profile-widget">
      {login && <Login title="" onClose={() => setLogin(false)} />}
      {user ? (
        <>
          <IconButton
            className="profile-button"
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={!!anchor}
            onClick={(e) => setAnchor(e.currentTarget)}
          >
            <PersonOutlineRounded />
          </IconButton>
          <Menu
            anchorEl={anchor}
            open={!!anchor}
            onClose={() => setAnchor(null)}
          >
            <MenuItem disabled>{user.email}</MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchor(null);
                getFirebaseApp().auth().signOut();
              }}
            >
              <ListItemIcon>
                <LogoutRounded fontSize="small" />
              </ListItemIcon>
              Log out
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Button variant="contained" onClick={() => setLogin(true)}>
          Sign in
        </Button>
      )}
    </div>
  );
};
