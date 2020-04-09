import React, { useState } from 'react';
import { ObjectItem } from '../types';
import { AddNewChat } from './Chat';
import { Login } from './Login';

export const ControlBar: React.FC<{
  authenticated: boolean;
  onAdd: (item: Omit<ObjectItem, 'author' | 'loc'>) => void;
}> = ({ authenticated, onAdd }) => {
  const [addType, setAddType] = useState<ObjectItem['type'] | null>(null);

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
