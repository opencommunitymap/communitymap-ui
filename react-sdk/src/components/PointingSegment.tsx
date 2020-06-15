import React from 'react';
import { Segment } from 'semantic-ui-react';
import './PointingSegment.css';

export const PointingSegment: React.FC = ({ children }) => {
  return (
    <Segment raised className="pointing-segment left pointing label">
      {children}
    </Segment>
  );

  // alternative approach
  // return <div className="pointing-segment pointing-label-right-side">{children}</div>
};
