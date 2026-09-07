import React from 'react';
import { CircularProgress, Typography } from '@mui/material';
import PublicRounded from '@mui/icons-material/PublicRounded';
import './SplashScreen.css';

export const SplashScreen: React.FC<{ showLogo?: boolean }> = ({
  showLogo = true,
}) => (
  <div className="splash" role="status">
    {showLogo && (
      <>
        <span className="splash-mark">
          <PublicRounded />
        </span>
        <Typography variant="h5">Open Community Map</Typography>
        <Typography color="text.secondary">
          Good things start nearby.
        </Typography>
      </>
    )}
    <CircularProgress size={26} aria-label="Loading your community" />
  </div>
);
