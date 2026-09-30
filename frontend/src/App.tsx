import React from 'react';
import { AppProviders } from './app/providers';
import { AppRoutes } from './app/routes';
import { AuthGate, AuthProvider } from './app/auth';

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </AuthGate>
    </AuthProvider>
  );
}
