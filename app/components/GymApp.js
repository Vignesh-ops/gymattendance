'use client';
import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import Navigation from './Navigation';
import LandingPage from './LandingPage';
import LoginView from './LoginView';
import RegisterView from './RegisterView';
import MemberDashboard from './MemberDashboard';
import AdminDashboard from './AdminDashboard';
import QRScanOptionsView from './QRScanOptionsView';
import Notification from './Notification';

const GymApp = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrScanPending, setQrScanPending] = useState(false);

  // Move handleQRScan inside useCallback
  const handleQRScan = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gymToken');
      
      if (!token) {
        setQrScanPending(true);
        setCurrentView('qr-scan-options');
        return;
      }

      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        showNotification(data.message, 'success');
        setQrScanPending(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (currentView === 'member-dashboard') {
          window.location.reload();
        }
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to process check-in/out', 'error');
    }
    setLoading(false);
  }, [currentView]); // Add currentView as dependency

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('gymToken', token);
    localStorage.setItem('gymUser', JSON.stringify(userData));
    
    if (qrScanPending) {
      handleQRScan();
    } else {
      setCurrentView(userData.role === 'admin' ? 'admin-dashboard' : 'member-dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('gymToken');
    localStorage.removeItem('gymUser');
    setCurrentView('landing');
    setQrScanPending(false);
  };

  const handleQRScanWithCredentials = async (credentials) => {
    setLoading(true);
    try {
      const response = await fetch('/api/attendance/qr-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (data.success) {
        showNotification(data.message, 'success');
        setQrScanPending(false);
        
        localStorage.setItem('gymToken', data.token);
        localStorage.setItem('gymUser', JSON.stringify(data.user));
        setUser(data.user);
        
        window.history.replaceState({}, document.title, window.location.pathname);
        setCurrentView('member-dashboard');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      showNotification('Failed to process QR scan', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    const userData = localStorage.getItem('gymUser');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentView(JSON.parse(userData).role === 'admin' ? 'admin-dashboard' : 'member-dashboard');
    }

    const params = new URLSearchParams(window.location.search);
    const scanToken = params.get('scan');
    if (scanToken) {
      setQrScanPending(true);
      if (token && userData) {
        handleQRScan();
      } else {
        setCurrentView('qr-scan-options');
      }
    }
  }, [handleQRScan]); // Now handleQRScan is stable

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navigation user={user} onLogout={handleLogout} onNavigate={setCurrentView} />
      
      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}

      <main>
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'member-login' && (
          <LoginView 
            onLogin={handleLogin} 
            type="member" 
            onNavigate={setCurrentView} 
            qrScanPending={qrScanPending}
          />
        )}
        {currentView === 'member-register' && (
          <RegisterView 
            onLogin={handleLogin} 
            onNavigate={setCurrentView} 
            qrScanPending={qrScanPending}
          />
        )}
        {currentView === 'admin-login' && <LoginView onLogin={handleLogin} type="admin" />}
        {currentView === 'member-dashboard' && <MemberDashboard user={user} onScan={handleQRScan} loading={loading} />}
        {currentView === 'admin-dashboard' && <AdminDashboard user={user} />}
        {currentView === 'qr-scan-options' && (
          <QRScanOptionsView 
            onQRScanWithCredentials={handleQRScanWithCredentials}
            onNavigate={setCurrentView}
            loading={loading}
          />
        )}
      </main>
    </div>
  );
};

export default GymApp;