import React, { useState, useMemo } from 'react';
import { Button, Icon, Modal, Form, List } from 'semantic-ui-react';
import { ObjectItemInput, ObjectItem, ObjectComment } from '../types';
import { reportError } from '../utils';

const formatAuthor = (author: string) => {
  return author.substr(0, 8);
};

const CommentsList: React.FC<{ comments: ObjectComment[] }> = ({
  comments,
}) => {
  return (
    <List relaxed divided size="big">
      {comments.map((c) => {
        const { id, author, comment, created } = c;
        return (
          <List.Item key={id}>
            <List.Content>
              <List.Description>
                {formatAuthor(author)} on {new Date(created).toLocaleString()}
              </List.Description>
              <List.Header>{comment}</List.Header>
            </List.Content>
          </List.Item>
        );
      })}
    </List>
  );
};

export const type2icon = (type: ObjectItemInput['type']) => {
  switch (type) {
    case 'request':
      return 'exclamation';
    case 'offer':
      return 'hand paper';
    case 'donation':
      return 'heart';
    case 'chat':
    default:
      return 'chat';
  }
};
export const type2title = (type: ObjectItemInput['type']) => {
  switch (type) {
    case 'request':
      return 'Ask Help';
    case 'offer':
      return 'Offer Help';
    case 'donation':
      return 'Donate';
    case 'chat':
    default:
      return 'Chat';
  }
};

export const ChatItem: React.FC<{
  item: ObjectItem;
  user: firebase.User | null;
  userVoted: boolean;
  votes: number;
  comments?: ObjectComment[];
  onVote: () => Promise<any>;
  onComment: (comment: string) => Promise<any>;
  onClose: () => Promise<any>;
}> = ({
  item,
  user,
  userVoted,
  votes,
  comments,
  onVote,
  onComment,
  onClose,
}) => {
  const { type, author, title, description, created } = item;

  const [comment, setComment] = useState<string | null>(null);

  const [expanded, setExpanded] = useState(false);

  const commentsCount = comments?.length || 0;

  const sortedComments = useMemo(() => {
    if (!comments) return comments;
    return comments.sort((l, r) => (l.created < r.created ? -1 : 1));
  }, [comments]);

  const icon: any = type2icon(type);

  const content = (
    <div className="chat-item" onClick={() => setExpanded(true)}>
      <div className="title">
        <Icon name={icon} />
        {title}
      </div>
      {expanded && (
        <div className="author-created">
          {formatAuthor(author)} on {new Date(created).toLocaleString()}
        </div>
      )}
      <br />
      {expanded && description !== title && <div>{description}</div>}
      {!!commentsCount && (
        <div className="replies-count">{commentsCount} replies</div>
      )}
      <div className="actions">
        <div className="like-widget">
          <Button
            icon
            disabled={userVoted}
            onClick={(e) => {
              e.stopPropagation();
              onVote().catch(reportError);
            }}
          >
            <Icon size="big" name="thumbs up outline" />
          </Button>
          {!!votes && <div className="votes-count">{votes}</div>}
        </div>

        <div className="comment-widget">
          {expanded && user?.uid === author && (
            <Button
              icon="close"
              content="Close"
              basic
              onClick={() => {
                if (window.confirm('Are you sure you want to close it?'))
                  onClose().catch(reportError);
              }}
            />
          )}
          {comment === null && !expanded && (
            <Button basic onClick={() => !comment && setComment('')}>
              Reply
            </Button>
          )}
        </div>
      </div>
      {expanded && !!commentsCount && (
        <div className="comments-section">
          <h4>Replies</h4>
          <CommentsList comments={sortedComments!} />
        </div>
      )}
      {(comment !== null || expanded) &&
        (!!user ? (
          <div className="leave-comment">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                !!comment &&
                  onComment(comment)
                    .then(() => setComment(null))
                    .catch(reportError);
              }}
            >
              <Form.Input
                value={comment || ''}
                placeholder="Your comment here"
                action={<Button icon="send" />}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            You need to register or sign in to be able to post
          </div>
        ))}
    </div>
  );

  return expanded ? (
    <Modal open closeIcon size="tiny" onClose={() => setExpanded(false)}>
      <Modal.Content scrolling>{content}</Modal.Content>
    </Modal>
  ) : (
    content
  );
};

export const AddNewChatObject: React.FC<{
  type: ObjectItemInput['type'];
  onPost: (data: ObjectItemInput) => void;
}> = ({ type, onPost }) => {
  const [state, setState] = useState({} as any);
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-chat">
      <h4>
        <Icon name={type2icon(type)} /> {type2title(type)}
      </h4>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          console.debug('submit', state);
          const { topic, message } = state;

          onPost({
            type,
            title: topic || message,
            description: message,
          });
        }}
      >
        <Form.Input
          autoComplete="off"
          label="Topic (optional)"
          name="topic"
          onChange={onChange}
        />
        <Form.TextArea
          autoFocus
          label="Message"
          name="message"
          onChange={onChange}
        />

        <Form.Button primary>Post</Form.Button>
      </Form>
    </div>
  );
};
