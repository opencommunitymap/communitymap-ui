import React from 'react';
import { useRenderAuthorCallback } from '../utils/renderAuthor';
import { useUserPublicInfo } from '../modules/DB';
import { RenderAuthorCallback } from '..';

export interface AuthorWidgetProps {
  userId: string;

  // Monitor the changes of user details in real-time
  watchForChanges?: boolean;
}

export const AuthorWidget: React.FC<AuthorWidgetProps> = React.memo(
  ({ userId, watchForChanges = false }) => {
    const renderAuthor = useRenderAuthorCallback() || defaultRenderAuthor;
    const userInfo = useUserPublicInfo(userId, watchForChanges);
    return userInfo ? renderAuthor(userInfo) : <span />;
  }
);

const defaultRenderAuthor: RenderAuthorCallback = (user) => (
  <span>{user.name || 'Anonymous'}</span>
);
