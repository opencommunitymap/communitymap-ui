import React, { useState, useMemo } from 'react';
import { Button, TextField, Stack, MenuItem } from '@mui/material';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import VolunteerActivismRounded from '@mui/icons-material/VolunteerActivismRounded';
import WavingHandRounded from '@mui/icons-material/WavingHandRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  ObjectItemInput,
  ObjectItemComponentProps,
  reportError,
  AuthorWidget,
} from '..';
import dayjs from 'dayjs';
import { CommentsList, PostCommentWidget } from './Comments';
import './Chat.css';
import './commonStyles.css';
import cx from 'classnames';
import { LikeWidget } from './LikeWidget';

export const type2icon = (type: ObjectItemInput['type']) => {
  switch (type) {
    case 'request':
      return WavingHandRounded;
    case 'offer':
      return VolunteerActivismRounded;
    case 'donation':
      return VolunteerActivismRounded;
    case 'chat':
    default:
      return ChatBubbleOutlineRounded;
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

export const Chat: React.FC<ObjectItemComponentProps> = ({
  item,
  user,
  expanded,
  onClick,
  onVote,
  onComment,
  onClose,
}) => {
  const {
    type,
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

  const TypeIcon = type2icon(type);

  return (
    <div
      className={cx({ item: true, 'chat-item': true, expanded })}
      onClick={onClick}
    >
      <div className="title">
        <TypeIcon />
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
              startIcon={<CloseRounded />}
              variant="outlined"
              onClick={() => {
                if (window.confirm('Are you sure you want to close it?'))
                  onClose().catch(reportError);
              }}
            >
              Close
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

const minutes2text = (minutes: number) => {
  if (minutes < 60) return `${minutes} minutes`;
  if (minutes < 24 * 60) return `${minutes / 60} hours`;
  return `${minutes / (24 * 60)} days`;
};

const validUntilOptions = [
  5,
  15,
  30,
  60,
  3 * 60,
  12 * 60,
  24 * 60,
  2 * 24 * 60,
  7 * 24 * 60,
].map((minutes) => ({
  value: minutes,
  key: minutes,
  text: minutes2text(minutes),
}));

export const AddNewChatObject: React.FC<{
  type: ObjectItemInput['type'];
  onPost: (data: ObjectItemInput) => void;
}> = ({ type, onPost }) => {
  const [state, setState] = useState({
    topic: '',
    message: '',
    valid_until: 12 * 60,
  });
  const TypeIcon = type2icon(type);
  const onChange = (e: any) => {
    const { name, value } = e.target;
    console.debug(e.target.name, e.target.value);
    setState({ ...state, [name]: value });
  };
  return (
    <div className="add-new-chat">
      <h4>
        <TypeIcon /> {type2title(type)}
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
          label="Topic (optional)"
          name="topic"
          onChange={onChange}
        />
        <TextField
          multiline
          minRows={4}
          autoFocus
          required
          label="Message"
          name="message"
          onChange={onChange}
        />
        <TextField
          select
          label="Visible for"
          value={state.valid_until}
          onChange={(e) =>
            setState({ ...state, valid_until: Number(e.target.value) })
          }
        >
          {validUntilOptions.map((option) => (
            <MenuItem key={option.key} value={option.value}>
              {option.text}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained">
          Post
        </Button>
      </Stack>
    </div>
  );
};
