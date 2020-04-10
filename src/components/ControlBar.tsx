import React, { useState } from 'react';
import { ObjectItemInput } from '../types';
import { AddNewChat } from './Chat';
import { Login } from './Login';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { reportError } from '../utils';

export const ControlBar: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);
  const [login, setLogin] = useState(false);

  const showLogin = login || (!authenticated && !!addType);

  const signOut = () => {
    firebase.auth().signOut();
    setLogin(false); // just in case
  };

  return (
    <div id="control-bar">
      {showLogin && <Login />}
      {authenticated && (
        <>
          {addType === 'chat' && (
            <div className="add-stuff-container">
              <button className="close-icon" onClick={() => setAddType(null)}>
                X
              </button>
              <AddNewChat
                onPost={(item) => {
                  onAdd(item)
                    .then(() => setAddType(null))
                    .catch(reportError);
                }}
              />
            </div>
          )}
        </>
      )}
      <button onClick={() => setAddType('chat')}>New chat</button>
      {authenticated ? (
        <button onClick={signOut}>Sign out</button>
      ) : (
        <button onClick={() => setLogin(true)}>Register or sign in</button>
      )}
    </div>
  );
};
