import React, { useState } from 'react';
import { ObjectItemInput, ObjectItem } from '../types';

export const ChatItem: React.FC<{ item: ObjectItem }> = ({ item }) => {
  const { author, title, description } = item;
  return (
    <div className="chat-item">
      <div>{author}</div>
      <br />
      <strong>{title}</strong>
      {description !== title && <div>{description}</div>}
    </div>
  );
};

export const AddNewChat: React.FC<{
  onPost: (data: ObjectItemInput) => void;
}> = ({ onPost }) => {
  const [state, setState] = useState({} as any);
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-item add-new-chat">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.debug('submit', state);
          const { topic, message } = state;

          onPost({
            type: 'chat',
            title: topic || message,
            description: message,
          });
        }}
      >
        <div>
          <label>
            Topic (optional)
            <input name="topic" onChange={onChange}></input>
          </label>
        </div>

        <div>
          <label>
            Message
            <textarea required name="message" onChange={onChange}></textarea>
          </label>
        </div>
        <button>Post</button>
      </form>
    </div>
  );
};
