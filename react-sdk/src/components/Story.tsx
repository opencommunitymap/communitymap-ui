import React, { useState, useMemo } from 'react';
import { Button, TextField, Stack } from '@mui/material';
import EditNoteRounded from '@mui/icons-material/EditNoteRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import {
  ObjectItemInput,
  ObjectItemComponentProps,
  reportError,
  AuthorWidget,
} from '..';
import dayjs from 'dayjs';
import { CommentsList, PostCommentWidget } from './Comments';
import './Story.css';
import './commonStyles.css';
import cx from 'classnames';
import { LikeWidget } from './LikeWidget';

export const Story: React.FC<ObjectItemComponentProps> = ({
  item,
  user,
  expanded,
  onClick,
  onVote,
  onComment,
  onClose,
}) => {
  const {
    author,
    title,
    description,
    created,
    userVoted,
    votesCount: votes,
    comments,
  } = item;

  const [showCommentsWidget, setShowCommentsWidget] = useState(false);

  const commentsCount = comments?.length || 0;

  const sortedComments = useMemo(() => {
    if (!comments) return comments;
    return comments.sort((l, r) => (l.created < r.created ? -1 : 1));
  }, [comments]);

  return (
    <div
      className={cx({ item: true, 'story-item': true, expanded })}
      onClick={onClick}
    >
      <div className="title">
        <EditNoteRounded />
        {title}
      </div>
      {expanded && (
        <div className="author-created">
          <AuthorWidget userId={author} watchForChanges />
          {' on '}
          {new Date(created).toLocaleString()}
        </div>
      )}

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
              startIcon={<DeleteOutlineRounded />}
              color="error"
              variant="outlined"
              onClick={() => {
                if (window.confirm('Are you sure you want to close it?'))
                  onClose().catch(reportError);
              }}
            >
              Delete
            </Button>
          )}
          {!showCommentsWidget && !expanded && (
            <Button
              variant="outlined"
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
  const [state, setState] = useState({
    topic: '',
    message: '',
    valid_until: 12 * 60,
  });
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-story">
      <h4>
        <EditNoteRounded /> Create story
      </h4>
      <Stack
        component="form"
        spacing={2.5}
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
        <TextField
          autoComplete="off"
          label="Subject"
          name="topic"
          onChange={onChange}
        />
        <TextField
          multiline
          minRows={7}
          autoFocus
          required
          label="Story"
          name="message"
          onChange={onChange}
        />

        <Button type="submit" variant="contained">
          Post
        </Button>
      </Stack>
    </div>
  );
};
