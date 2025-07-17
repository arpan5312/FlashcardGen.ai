import React, { useState } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import EmailVerificationPage from './EmailverificationPage';
import ForgotPasswordPage from './ForgotPasswordPage';

type AuthView = 'login' | 'signup' | 'verification' | 'forgot-password';

const AuthContainer: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleSwitchToSignup = () => setCurrentView('signup');
  const handleSwitchToLogin = () => setCurrentView('login');
  const handleSwitchToForgotPassword = () => setCurrentView('forgot-password');
  
  const handleShowVerification = (email: string) => {
    setVerificationEmail(email);
    setCurrentView('verification');
  };

  switch (currentView) {
    case 'signup':
      return (
        <SignupPage
          onSwitchToLogin={handleSwitchToLogin}
          onShowVerification={handleShowVerification}
        />
      );
    
    case 'verification':
      return (
        <EmailVerificationPage
          email={verificationEmail}
          onBackToLogin={handleSwitchToLogin}
        />
      );
    
    case 'forgot-password':
      return (
        <ForgotPasswordPage
          onBackToLogin={handleSwitchToLogin}
        />
      );
    
    case 'login':
    default:
      return (
        <LoginPage
          onSwitchToSignup={handleSwitchToSignup}
          onSwitchToForgotPassword={handleSwitchToForgotPassword}
        />
      );
  }
};

export default AuthContainer;