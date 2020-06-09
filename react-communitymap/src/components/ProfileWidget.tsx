import React, { useState, useEffect } from 'react';
import getFirebase from '../utils/firebase';
import { useAuth, Login } from '..';
import { Dropdown, Button, Icon } from 'semantic-ui-react';
import './ProfileWidget.css';

export const ProfileWidget: React.FC = () => {
  const user = useAuth();

  const [login, setLogin] = useState(false);
  useEffect(() => {
    if (user && login) {
      setLogin(false);
    }
  }, [user, login]);

  const signOut = () => getFirebase().auth().signOut();

  return (
    <div id="profile-widget">
      {login && <Login title="" onClose={() => setLogin(false)} />}
      {user ? (
        <Dropdown
          trigger={
            <Button className="profile-button" icon size="large">
              <Icon.Group>
                <Icon name="user outline" />
              </Icon.Group>
            </Button>
          }
          pointing="top right"
          icon={null}
        >
          <Dropdown.Menu>
            <Dropdown.Item disabled>{user.email}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={signOut}>
              <Icon name="log out" />
              Log out
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ) : (
        <Button primary size="large" onClick={() => setLogin(true)}>
          Sign in
        </Button>
      )}
    </div>
  );
};
