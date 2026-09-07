import React from 'react';
import { IconButton } from '@mui/material';
import ThumbUpOutlined from '@mui/icons-material/ThumbUpOutlined';
import './LikeWidget.css';
import { reportError } from '..';

export interface LikeWidgetProps {
  votes: number;
  userVoted: boolean;
  onVote: () => Promise<any>;
}

export const LikeWidget: React.FC<LikeWidgetProps> = ({
  votes,
  userVoted,
  onVote,
}) => {
  return (
    <div className="like-widget">
      <IconButton
        aria-label={userVoted ? 'Already liked' : 'Like this post'}
        aria-pressed={userVoted}
        color="primary"
        disabled={userVoted}
        onClick={(e) => {
          e.stopPropagation();
          onVote().catch(reportError);
        }}
      >
        <ThumbUpOutlined fontSize="small" />
      </IconButton>
      {!!votes && <div className="votes-count">{votes}</div>}
    </div>
  );
};
