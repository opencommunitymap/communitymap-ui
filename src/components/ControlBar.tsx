import React, { useState, useEffect } from 'react';
import { Button, Segment, Icon, Modal } from 'semantic-ui-react';
import { ObjectItemInput } from '../types';
import { AddNewChatObject, type2icon, type2title } from './Chat';
import { Login } from './Login';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { reportError } from '../utils';

export const AuthBar: React.FC<{ user: firebase.User | null }> = ({ user }) => {
  const [login, setLogin] = useState(false);
  useEffect(() => {
    if (user && login) {
      setLogin(false);
    }
  }, [user, login]);

  const signOut = () => firebase.auth().signOut();

  return (
    <div id="auth-bar">
      {login && <Login title="" />}
      {user ? (
        <Button id="sign-out-button" basic icon size="large" onClick={signOut}>
          <Icon name="sign out" />
        </Button>
      ) : (
        <Button primary size="large" onClick={() => setLogin(true)}>
          Sign in
        </Button>
      )}
    </div>
  );
};

export const ControlBar: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);

  const showLogin = !authenticated && !!addType;

  return (
    <Segment id="control-bar">
      {showLogin && <Login />}
      {authenticated && (
        <>
          {!!addType && (
            <Modal open size="tiny" closeIcon onClose={() => setAddType(null)}>
              <Modal.Content>
                <AddNewChatObject
                  type={addType}
                  onPost={(item) => {
                    onAdd(item)
                      .then(() => setAddType(null))
                      .catch(reportError);
                  }}
                />
              </Modal.Content>
            </Modal>
          )}
        </>
      )}
      <h5>I want to post</h5>
      {([
        'chat',
        'request',
        'offer',
        'donation',
      ] as ObjectItemInput['type'][]).map((type) => (
        <Button
          key={type}
          icon={type2icon(type)}
          // basic
          primary
          content={type2title(type)}
          onClick={() => setAddType(type)}
        />
      ))}
    </Segment>
  );
};

export const NavigationBar: React.FC<{
  onChangePosition: (lat: number, lng: number) => void;
}> = ({ onChangePosition }) => {
  const [loading, setLoading] = useState(false);
  const locate = () => {
    const geo = window.navigator.geolocation;
    if (!geo) {
      alert("Your browser doesn't support geolocation");
      return;
    }
    setLoading(true);
    geo.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onChangePosition(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        console.log('Error getting location', err);
        alert('Cannot get location');
      },
      { enableHighAccuracy: true }
    );
  };
  return (
    <div id="navigation-bar">
      <Button
        loading={loading}
        primary
        icon="location arrow"
        onClick={locate}
      ></Button>
    </div>
  );
};
