import React, { useState, useEffect, useContext } from 'react';
import { AuthUser } from '..';
import { getFirebaseApp } from '../utils/firebase';
import 'firebase/compat/auth';

const AuthContext = React.createContext<AuthUser>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser>();

  useEffect(() => {
    return getFirebaseApp()
      .auth()
      .onIdTokenChanged(
        (user) => {
          console.debug('Loaded user', user);
          setUser(user);
        },
        (err) => {
          console.log('Error loading Auth info:', err);
        }
      );
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
