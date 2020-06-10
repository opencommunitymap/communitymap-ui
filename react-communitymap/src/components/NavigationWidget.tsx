import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { detectLocation, Loc } from '..';

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
