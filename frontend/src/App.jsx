import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import { SocketProvider } from './services/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { brandConfig, applyBrandTheme } from './config/brand';
import ErrorBoundary from './components/ErrorBoundary';
import ConsentManager from './components/ConsentManager';
import MessageTest from './components/MessageTest';
import WhatsAppTest from './pages/WhatsAppTest';
import SimpleWhatsAppTest from './pages/SimpleWhatsAppTest';
import CompleteWhatsAppTest from './pages/CompleteWhatsAppTest';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './styles/professional.css';
import './styles/toast.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  React.useEffect(() => {
    applyBrandTheme();
    document.title = brandConfig.appName;
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="crm-app">
                <ConsentManager />
                <Routes>
              <Route path="/test" element={<MessageTest />} />
              <Route path="/whatsapp-test" element={<SimpleWhatsAppTest />} />
              <Route path="/complete-test" element={<CompleteWhatsAppTest />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <SocketProvider>
                      <Dashboard />
                    </SocketProvider>
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;