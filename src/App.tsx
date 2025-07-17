// App.tsx
import React from 'react';
import { useAuth } from './components/context/AuthContext';
import SignupPage from './components/authentication/SignupPage';
import LoginPage from './components/authentication/LoginPage';
import VerifyEmailPage from './components/authentication/EmailverificationPage';
import MainApp from './MainApp';

function App() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = React.useState<'login' | 'signup' | 'verify'>('login');
  const [pendingEmail, setPendingEmail] = React.useState('');

  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    if (mode === 'signup') {
      return (
        <SignupPage
          onSwitchToLogin={() => setMode('login')}
          onShowVerification={(email) => {
            setPendingEmail(email);
            setMode('verify');
          }}
        />
      );
    } else if (mode === 'verify') {
      return (
        <VerifyEmailPage
          email={pendingEmail}
          onBackToLogin={() => setMode('login')}
        />
      );
    } else {
      return <LoginPage onSwitchToSignup={() => setMode('signup')} onSwitchToForgotPassword={function (): void {
        throw new Error('Function not implemented.');
      } } />;
    }
  }

  if (!user.isEmailVerified) {
    return (
      <VerifyEmailPage
        email={user.email}
        onBackToLogin={() => {
          setMode('login');
          localStorage.removeItem('flashcard_user');
          window.location.reload();
        }}
      />
    );
  }

  return <MainApp />;
}

export default App;
