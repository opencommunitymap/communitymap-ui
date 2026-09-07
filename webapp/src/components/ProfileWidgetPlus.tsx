import React, { useState, useEffect } from 'react';
import {
  useAuth,
  useMyDirectMessages,
  useUserPublicInfo,
  useAsyncStatus,
  saveUserPublicInfo,
  getFirebaseApp,
  CommunityDialog,
} from '@opencommunitymap/react-sdk';
import firebase from 'firebase';
import {
  Menu,
  MenuItem,
  Button,
  IconButton,
  Badge,
  TextField,
  CircularProgress,
  Alert,
  Avatar,
  Stack,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuRounded from '@mui/icons-material/MenuRounded';
import PersonOutlineRounded from '@mui/icons-material/PersonOutlineRounded';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import LoginRounded from '@mui/icons-material/LoginRounded';
import { Link } from 'react-router-dom';
import { Login } from './Login';

export const ProfileWidgetPlus: React.FC = () => {
  const user = useAuth();
  const { dialogs } = useMyDirectMessages();
  const unreadDialogs =
    dialogs?.filter((dlg) => dlg.lastMsgId !== dlg.lastReadBy[user?.uid || ''])
      .length || 0;
  const [login, setLogin] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  useEffect(() => {
    if (user && login) setLogin(false);
  }, [user, login]);
  const closeMenu = () => setAnchor(null);

  return (
    <div id="profile-widget">
      {login && (
        <Login
          title="Welcome to your community"
          onClose={() => setLogin(false)}
        />
      )}
      {showProfile && user && (
        <CommunityDialog
          open
          onClose={() => setShowProfile(false)}
          title="Your profile"
        >
          <EditUserProfile user={user} />
        </CommunityDialog>
      )}
      {!user && (
        <Button
          className="sign-in-button"
          variant="contained"
          onClick={() => setLogin(true)}
        >
          Sign in
        </Button>
      )}
      <IconButton
        className="profile-button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        aria-controls={anchor ? 'account-menu' : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <Badge badgeContent={unreadDialogs} color="secondary">
          {user ? <PersonOutlineRounded /> : <MenuRounded />}
        </Badge>
      </IconButton>
      <Menu
        id="account-menu"
        anchorEl={anchor}
        open={!!anchor}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {user && <MenuItem disabled>{user.email}</MenuItem>}
        {user && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setShowProfile(true);
            }}
          >
            <ListItemIcon>
              <PersonOutlineRounded fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
        )}
        {user && (
          <MenuItem component={Link} to="/my-messages" onClick={closeMenu}>
            <ListItemIcon>
              <Badge badgeContent={unreadDialogs} color="secondary">
                <MailOutlineRounded fontSize="small" />
              </Badge>
            </ListItemIcon>
            Messages
          </MenuItem>
        )}
        {user && <Divider />}
        <MenuItem component={Link} to="/terms" onClick={closeMenu}>
          Terms of Service
        </MenuItem>
        <MenuItem component={Link} to="/privacy" onClick={closeMenu}>
          Privacy Policy
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenu();
            user ? getFirebaseApp().auth().signOut() : setLogin(true);
          }}
        >
          <ListItemIcon>
            {user ? (
              <LogoutRounded fontSize="small" />
            ) : (
              <LoginRounded fontSize="small" />
            )}
          </ListItemIcon>
          {user ? 'Log out' : 'Sign in'}
        </MenuItem>
      </Menu>
    </div>
  );
};

const EditUserProfile: React.FC<{ user: firebase.User }> = ({ user }) => {
  const info = useUserPublicInfo(user.uid, true);
  const [changed, setChanged] = useState<{ name: string } | null>(null);
  const { status, func: saveInfo } = useAsyncStatus(async () =>
    saveUserPublicInfo({
      ...(info || { id: user.uid }),
      ...(changed || { name: '' }),
    })
  );
  if (info === undefined)
    return <CircularProgress aria-label="Loading profile" />;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar
          src={user.photoURL || undefined}
          sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
        >
          {(info?.name || user.email || '?')[0].toUpperCase()}
        </Avatar>
        <div>
          <Typography variant="h6">
            {info?.name || 'Your community profile'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {info?.created
              ? `Joined ${new Date(info.created).toLocaleDateString()}`
              : 'Make yourself at home'}
          </Typography>
        </div>
      </Stack>
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={(e) => {
          e.preventDefault();
          saveInfo();
        }}
      >
        <TextField
          label="Name / nickname"
          required
          value={changed?.name ?? info?.name ?? ''}
          disabled={status.pending}
          onChange={(e) => setChanged({ name: e.target.value })}
        />
        {status.error && <Alert severity="error">{String(status.error)}</Alert>}
        {status.success && <Alert severity="success">Profile saved.</Alert>}
        <Stack direction="row" spacing={1}>
          <Button
            type="submit"
            variant="contained"
            disabled={!changed || status.pending}
            loading={status.pending}
          >
            Save changes
          </Button>
          <Button
            type="button"
            disabled={!changed || status.pending}
            onClick={() => setChanged(null)}
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
