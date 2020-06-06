import React, { useState, useMemo } from 'react';
import { Button, Icon, Form } from 'semantic-ui-react';
import {
  ObjectItemInput,
  ObjectItemComponentProps,
  useUserPublicInfo,
} from 'react-communitymap';
import { reportError } from '../utils';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { CommentsList, PostCommentWidget } from './Comments';
import './Story.css';
import cx from 'classnames';
import { LikeWidget } from './LikeWidget';

export const StoryItem: React.FC<ObjectItemComponentProps> = ({
  item,
  user,
  userVoted,
  votes,
  comments,
  expanded,
  onClick,
  onVote,
  onComment,
  onClose,
}) => {
  const { author, title, description, created } = item;

  const authorInfo = useUserPublicInfo(author, true);

  const [showCommentsWidget, setShowCommentsWidget] = useState(false);

  const commentsCount = comments?.length || 0;

  const sortedComments = useMemo(() => {
    if (!comments) return comments;
    return comments.sort((l, r) => (l.created < r.created ? -1 : 1));
  }, [comments]);

  const icon = 'edit outline';

  return (
    <div
      className={cx({ item: true, 'story-item': true, expanded })}
      onClick={onClick}
    >
      <div className="title">
        <Icon name={icon} />
        {title}
      </div>
      {expanded && (
        <div className="author-created">
          <Link to={`/users/${author}`}>{authorInfo?.name || 'Anonymous'}</Link>{' '}
          on {new Date(created).toLocaleString()}
        </div>
      )}
      <br />
      {expanded && description !== title && (
        <section className="description">{description}</section>
      )}
      {!!commentsCount && (
        <div className="replies-count">{commentsCount} replies</div>
      )}
      <div className="actions">
        <LikeWidget votes={votes} userVoted={userVoted} onVote={onVote} />

        <div>
          {expanded && user?.uid === author && (
            <Button
              icon="close"
              content="Delete"
              basic
              onClick={() => {
                if (window.confirm('Are you sure you want to close it?'))
                  onClose().catch(reportError);
              }}
            />
          )}
          {!showCommentsWidget && !expanded && (
            <Button
              basic
              onClick={(e) => {
                e.stopPropagation();
                setShowCommentsWidget(true);
              }}
            >
              Reply
            </Button>
          )}
        </div>
      </div>
      {expanded && !!commentsCount && (
        <section>
          <h4 className="pale-heading">Replies</h4>
          <CommentsList comments={sortedComments!} />
        </section>
      )}
      {(showCommentsWidget || expanded) &&
        (!!user ? (
          <PostCommentWidget onComment={onComment} />
        ) : (
          <div style={{ textAlign: 'center' }}>
            You need to register or sign in to be able to post
          </div>
        ))}
    </div>
  );
};

export const AddNewStoryObject: React.FC<{
  type: ObjectItemInput['type'];
  onPost: (data: ObjectItemInput) => void;
}> = ({ type, onPost }) => {
  const [state, setState] = useState({ valid_until: 12 * 60 } as any);
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-story">
      <h4>
        <Icon name="edit outline" /> Create story
      </h4>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          console.debug('submit', state);
          const { topic, message, valid_until } = state;

          onPost({
            type,
            title: topic || message,
            description: message,
            valid_until: dayjs().add(valid_until, 'minute').toISOString(),
          });
        }}
      >
        <Form.Input
          autoComplete="off"
          label="Subject"
          name="topic"
          onChange={onChange}
        />
        <Form.TextArea
          autoFocus
          label="Story"
          name="message"
          onChange={onChange}
        />

        <Form.Button primary>Post</Form.Button>
      </Form>
    </div>
  );
};
