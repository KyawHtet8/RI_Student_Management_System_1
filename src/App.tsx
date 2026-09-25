import React from 'react';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
