import React, { useState } from 'react';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';
import MyLocationRounded from '@mui/icons-material/MyLocationRounded';
import { detectLocation, Loc } from '..';
import './commonStyles.css';

export const NavigationWidget: React.FC<{
  onChangePosition: (loc: Loc) => void;
}> = ({ onChangePosition }) => {
  const [loading, setLoading] = useState(false);

  const locate = async () => {
    setLoading(true);
    try {
      const pos = await detectLocation();
      onChangePosition(pos);
    } catch (err) {
      console.log('Error getting location', err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="navigation-widget">
      <Tooltip title="Find my location">
        <span>
          <IconButton
            aria-label="Find my location"
            disabled={loading}
            onClick={locate}
            color="primary"
          >
            {loading ? <CircularProgress size={22} /> : <MyLocationRounded />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};
