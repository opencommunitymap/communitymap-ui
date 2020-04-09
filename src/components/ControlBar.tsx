import React, { useState } from 'react';
import { ObjectItemInput } from '../types';
import { AddNewChat } from './Chat';
import { Login } from './Login';

export const ControlBar: React.FC<{
  authenticated: boolean;
  onAdd: (item: ObjectItemInput) => void;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItemInput['type'] | null>(null);

  return (
    <div id="control-bar">
      {!authenticated && !!addType && <Login />}
      {authenticated && (
        <>
          {addType === 'chat' && (
            <AddNewChat
              onPost={({ topic, message }) => {
                onAdd({
                  title: topic || null,
                  description: message,
                  type: addType,
                });
                setAddType(null);
              }}
            />
          )}
        </>
      )}
      <button onClick={() => setAddType('chat')}>New chat</button>
    </div>
  );
};
