import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { Maps } from './components/Maps';

const SplashScreen = () => {
  return (
    <div className="splash">
      <header className="splash-header">
        <img src={logo} className="splash-logo" alt="logo" />
      </header>
    </div>
  );
};

const Home = () => {
  return (
    <div className="home">
      <Maps />
    </div>
  );
};

function App() {
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    setTimeout(() => setSplash(false), 2000);
  }, []);

  if (splash) return <SplashScreen />;

  return <Home />;
}

export default App;
