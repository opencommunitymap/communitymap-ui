import React from 'react';
import logo from '../logo.svg';

export const SplashScreen = () => {
  return (
    <div className="splash">
      <header className="splash-header">
        <img src={logo} className="splash-logo" alt="logo" />
      </header>
    </div>
  );
};
