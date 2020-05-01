import React, { useState, useEffect } from 'react';
import { Button, Segment, Icon, Modal, Dropdown } from 'semantic-ui-react';
import { ObjectItemInput } from '../types';
import { AddNewChatObject, type2icon, type2title } from './Chat';
import { Login } from './Login';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { reportError } from '../utils';
import { EditUserProfile } from './Profile';
import { AddNewPlaceObject } from './Place';
import { useAuth } from '../Auth';

export const AuthBar: React.FC = () => {
  const user = useAuth();
  const [login, setLogin] = useState(false);
  useEffect(() => {
    if (user && login) {
      setLogin(false);
    }
  }, [user, login]);

  const [showProfile, setShowProfile] = useState(false);

  const signOut = () => firebase.auth().signOut();

  return (
    <div id="auth-bar">
      {login && <Login title="" />}
      {showProfile && !!user && (
        <Modal open closeIcon onClose={() => setShowProfile(false)}>
          <Modal.Header>Your profile</Modal.Header>
          <Modal.Content>
            <EditUserProfile user={user} />
          </Modal.Content>
        </Modal>
      )}
      {user ? (
        <Dropdown
          trigger={
            <Button basic icon size="large">
              <Icon name="user outline" />
            </Button>
          }
          pointing="top right"
          icon={null}
        >
          <Dropdown.Menu>
            <Dropdown.Item disabled>{user.email}</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => setShowProfile(true)}>
              <Icon name="user" />
              Profile
            </Dropdown.Item>
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

const AddNewObjectRender: React.FC<{
  type: ObjectItemInput['type'];
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ type, onAdd }) => {
  switch (type) {
    case 'place':
      return <AddNewPlaceObject type={type} onPost={onAdd} />;
    default:
      return <AddNewChatObject type={type} onPost={onAdd} />;
  }
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
                <AddNewObjectRender
                  type={addType}
                  onAdd={(it) =>
                    onAdd(it)
                      .then(() => setAddType(null))
                      .catch(reportError)
                  }
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
        // 'donation',
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
      <hr />
      <Button
        key="place"
        icon="building"
        primary
        content="Place"
        onClick={() => setAddType('place')}
      />
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
