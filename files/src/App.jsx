import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage       from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage  from './pages/DashboardPage';
import './index.css';

function AppRouter() {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <AuthPage />;
  }

  if (!userProfile?.onboardingComplete) {
    return <OnboardingPage />;
  }

  return <DashboardPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
