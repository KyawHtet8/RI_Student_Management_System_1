import React from 'react';
import { AppStoreProvider } from './store';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppStoreProvider>
      {children}
    </AppStoreProvider>
  );
};
