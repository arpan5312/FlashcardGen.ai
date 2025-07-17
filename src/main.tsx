import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './components/context/AuthContext';
import { ThemeProvider } from './components/context/ThemeContext'; // ✅ Import your ThemeProvider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>           {/* ✅ Wrap with ThemeProvider first */}
      <AuthProvider>          {/* ✅ Then AuthProvider */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
