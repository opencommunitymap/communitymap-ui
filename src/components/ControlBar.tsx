import React, { useState } from 'react';
import { ObjectItem } from '../types';
import { AddNewChat } from './Chat';

export const ControlBar: React.FC<{
  onAdd: (item: Omit<ObjectItem, 'author' | 'loc'>) => void;
}> = ({ onAdd }) => {
  const [addType, setAddType] = useState<ObjectItem['type'] | null>(null);

  return (
    <div id="control-bar">
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
      <button onClick={() => setAddType('chat')}>New chat</button>
    </div>
  );
};
