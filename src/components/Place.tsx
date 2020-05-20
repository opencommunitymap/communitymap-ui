import React, { useState, useMemo } from 'react';
import { ObjectItem, ObjectComment, ObjectItemInput } from '../types';
import { Icon, Image, Button, Form } from 'semantic-ui-react';
import { reportError } from '../utils';
import { CommentsList } from './Comments';
import cx from 'classnames';

export const Place: React.FC<{
  item: ObjectItem;
  user: firebase.User | null;
  userVoted: boolean;
  votes: number;
  comments?: ObjectComment[];
  expanded?: boolean;
  onClick?: () => void;
  onVote: () => Promise<any>;
  onComment: (comment: string) => Promise<any>;
}> = ({
  item,
  user,
  userVoted,
  votes,
  comments,
  expanded,
  onClick,
  onVote,
  onComment,
}) => {
  const { title, description, logoURL, short_description } = item;

  const [comment, setComment] = useState<string | null>(null);

  const commentsCount = comments?.length || 0;

  const sortedComments = useMemo(() => {
    if (!comments) return comments;
    return comments.sort((l, r) => (l.created < r.created ? -1 : 1));
  }, [comments]);

  const icon = 'building outline';

  return (
    <div className={cx({ item: true, 'place-item': true, expanded })}>
      <div className="title" onClick={onClick}>
        {logoURL ? <Image src={logoURL} /> : <Icon name={icon} />}
        {title}
      </div>
      <br />
      {!!short_description && (
        <div className="short-description">{short_description}</div>
      )}
      {expanded && description !== title && (
        <div className="description">{description}</div>
      )}
      {!!commentsCount && (
        <div className="replies-count">{commentsCount} comments</div>
      )}
      {expanded && (
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
            {comment === null && !expanded && (
              <Button basic onClick={() => !comment && setComment('')}>
                Reply
              </Button>
            )}
          </div>
        </div>
      )}
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
};

export const AddNewPlaceObject: React.FC<{
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
        <Icon name="building outline" /> New place
      </h4>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          console.debug('submit', state);
          const { placeName, description, short_description = null } = state;

          onPost({
            type,
            title: placeName,
            description,
            short_description,
            valid_until: '2100-01-05T09:00:00.000Z',
          });
        }}
      >
        <Form.Input
          autoComplete="off"
          label="Name"
          placeholder="e.g. Annie's Bakery"
          name="placeName"
          required
          onChange={onChange}
        />
        <Form.Input
          autoComplete="off"
          label="Very brief description"
          name="short_description"
          placeholder="e.g. Nice bagels and tasty latte"
          required
          onChange={onChange}
        />
        <Form.TextArea
          autoFocus
          required
          label="Desciption"
          name="description"
          onChange={onChange}
        />

        <Form.Button primary>Add</Form.Button>
      </Form>
    </div>
  );
};
