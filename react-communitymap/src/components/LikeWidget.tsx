import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
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
  );
};
