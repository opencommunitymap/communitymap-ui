import React from 'react';
import { Paper } from '@mui/material';
import './PointingSegment.css';

export const PointingSegment: React.FC<React.PropsWithChildren> = ({
  children,
}) => <Paper className="pointing-segment">{children}</Paper>;
