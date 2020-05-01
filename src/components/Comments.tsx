import React from 'react';
import { ObjectComment } from '../types';
import { useUserPublicInfo } from '../DB';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

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
    <List relaxed divided size="big">
      {comments.map((c) => (
        <CommentView key={c.id} comment={c} />
      ))}
    </List>
  );
};
