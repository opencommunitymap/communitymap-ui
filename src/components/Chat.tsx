import React, { useState } from 'react';
import { ObjectItemInput, ObjectItem, ObjectComment } from '../types';
import { reportError } from '../utils';

export const ChatItem: React.FC<{
  item: ObjectItem;
  authenticated: boolean;
  userVoted: boolean;
  votes: number;
  comments?: ObjectComment[];
  onVote: () => Promise<any>;
  onComment: (comment: string) => Promise<any>;
}> = ({
  item,
  authenticated,
  userVoted,
  votes,
  comments,
  onVote,
  onComment,
}) => {
  const { author, title, description } = item;

  const [comment, setComment] = useState<string | null>(null);

  return (
    <div className="chat-item">
      <div>{author}</div>
      <br />
      <strong>{title}</strong>
      {description !== title && <div>{description}</div>}
      <div>
        <button
          disabled={userVoted}
          onClick={() => onVote().catch(reportError)}
        >
          Vote up!
        </button>
        {!!votes && <span>{votes} voted</span>}

        <div>{comments?.length && <div>{comments?.length} comments</div>}</div>
        <>
          {comment === null && (
            <button onClick={() => setComment('')}>Comment</button>
          )}
          {comment !== null &&
            (authenticated ? (
              <>
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button
                  onClick={() =>
                    !!comment &&
                    onComment(comment)
                      .then(() => setComment(null))
                      .catch(reportError)
                  }
                >
                  Post
                </button>
              </>
            ) : (
              <div>You need to register or sign in</div>
            ))}
        </>
      </div>
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
    <div className="add-new-chat">
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
