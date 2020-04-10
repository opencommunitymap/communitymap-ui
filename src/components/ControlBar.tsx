import React, { useState } from 'react';
import { ObjectItemInput } from '../types';
import { AddNewChat } from './Chat';
import { Login } from './Login';

export const ControlBar: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => Promise<any>;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);

  return (
    <div id="control-bar">
      {!authenticated && !!addType && <Login />}
      {authenticated && (
        <>
          {addType === 'chat' && (
            <AddNewChat
              onPost={(item) => {
                onAdd(item).then(() => setAddType(null));
              }}
            />
          )}
        </>
      )}
      <button onClick={() => setAddType('chat')}>New chat</button>
    </div>
  );
};
