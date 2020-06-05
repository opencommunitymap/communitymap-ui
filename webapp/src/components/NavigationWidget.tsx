import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { detectLocation } from '../utils';

export const NavigationWidget: React.FC<{
  onChangePosition: (lat: number, lng: number) => void;
}> = ({ onChangePosition }) => {
  const [loading, setLoading] = useState(false);

  const locate = async () => {
    setLoading(true);
    try {
      const pos = await detectLocation();
      onChangePosition(pos.latitude, pos.longitude);
    } catch (err) {
      console.log('Error getting location', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="navigation-widget">
      <Button
        loading={loading}
        primary
        icon="location arrow"
        onClick={locate}
      ></Button>
    </div>
  );
};
