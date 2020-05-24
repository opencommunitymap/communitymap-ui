import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';

export const NavigationWidget: React.FC<{
  onChangePosition: (lat: number, lng: number) => void;
}> = ({ onChangePosition }) => {
  const [loading, setLoading] = useState(false);
  const locate = () => {
    const geo = window.navigator.geolocation;
    if (!geo) {
      alert("Your browser doesn't support geolocation");
      return;
    }
    setLoading(true);
    geo.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onChangePosition(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        console.log('Error getting location', err);
        alert('Cannot get location');
      },
      { enableHighAccuracy: true }
    );
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
