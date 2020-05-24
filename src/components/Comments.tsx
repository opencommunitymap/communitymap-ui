import React, { useState } from 'react';
import { ObjectComment } from '../types';
import { useUserPublicInfo } from '../DB';
import { List, Form, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './Comments.css';
import { reportError } from '../utils';

const CommentView: React.FC<{ comment: ObjectComment }> = ({ comment: c }) => {
  const { author, comment, created } = c;
  const authorInfo = useUserPublicInfo(author);
  return (
    <List.Item>
      <List.Content>
        <List.Description>
          <Link to={`/users/${author}`}>{authorInfo?.name || 'Anonymous'}</Link>{' '}
          on {new Date(created).toLocaleString()}
        </List.Description>
        <List.Header>{comment}</List.Header>
      </List.Content>
    </List.Item>
  );
};

export const CommentsList: React.FC<{ comments: ObjectComment[] }> = ({
  comments,
}) => {
  return (
    <List relaxed divided size="big" className="comments-list">
      {comments.map((c) => (
        <CommentView key={c.id} comment={c} />
      ))}
    </List>
  );
};

export const PostCommentWidget: React.FC<{
  onComment: (comment: string) => Promise<any>;
}> = ({ onComment }) => {
  const [comment, setComment] = useState<string | null>(null);
  return (
    <div
      onClick={(e) => {
        // when put into map item click in form input causes the item to expand
        e.stopPropagation();
      }}
    >
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
  );
};
