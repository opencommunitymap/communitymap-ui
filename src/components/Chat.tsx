import React, { useState } from 'react';

export const ChatItem: React.FC<{ lat: number; lng: number }> = ({
  children,
}) => <div className="chat-item">{children}</div>;

export const AddNewChat: React.FC<{ onPost: (data: any) => void }> = ({
  onPost,
}) => {
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
          onPost(state);
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
