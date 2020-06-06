import React, { useState, useEffect, useContext } from 'react';
import { AuthUser } from '..';
import * as firebase from 'firebase/app';
import 'firebase/auth';

const AuthContext = React.createContext<AuthUser>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null | undefined>();

  useEffect(() => {
    return firebase.auth().onIdTokenChanged((user) => {
      console.debug('Loaded user', user);
      setUser(user);
    });
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
