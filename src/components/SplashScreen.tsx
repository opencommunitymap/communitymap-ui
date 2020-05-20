import React from 'react';
import logo from '../logo.svg';

export const SplashScreen: React.FC<{ showLogo?: boolean }> = ({
  showLogo = true,
}) => {
  return (
    <div className="splash">
      <header className="splash-header">
        {showLogo && <img src={logo} className="splash-logo" alt="logo" />}
      </header>
    </div>
  );
};
