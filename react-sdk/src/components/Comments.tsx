import React, { useState } from 'react';
import {
  List,
  ListItem,
  Typography,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import SendRounded from '@mui/icons-material/SendRounded';
import './Comments.css';
import { ObjectComment, reportError, AuthorWidget } from '..';

export const CommentsList: React.FC<{ comments: ObjectComment[] }> = ({
  comments,
}) => (
  <List className="comments-list" disablePadding>
    {comments.map(({ id, author, comment, created }) => (
      <ListItem key={id} disableGutters divider>
        <Stack spacing={0.75}>
          <Typography component="div" variant="caption" color="text.secondary">
            <AuthorWidget userId={author} /> ·{' '}
            {new Date(created).toLocaleString()}
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {comment}
          </Typography>
        </Stack>
      </ListItem>
    ))}
  </List>
);

export const PostCommentWidget: React.FC<{
  onComment: (comment: string) => Promise<any>;
}> = ({ onComment }) => {
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState(false);
  return (
    <form
      onClick={(e) => e.stopPropagation()}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!comment.trim() || pending) return;
        setPending(true);
        try {
          await onComment(comment);
          setComment('');
        } catch (error) {
          reportError(
            error instanceof Error ? error : new Error(String(error))
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <TextField
        size="small"
        label="Your comment"
        value={comment}
        disabled={pending}
        onChange={(e) => setComment(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  color="primary"
                  aria-label="Send comment"
                  disabled={pending || !comment.trim()}
                >
                  <SendRounded fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </form>
  );
};
