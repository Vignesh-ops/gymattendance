'use client';
import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

const QRScanOptionsView = ({ onQRScanWithCredentials, onNavigate, loading }) => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');

  const handleQuickScan = async (e) => {
    e.preventDefault();
    setError('');

    if (!credentials.phone || !credentials.password) {
      setError('Please enter both phone number and password');
      return;
    }

    await onQRScanWithCredentials(credentials);
  };

  const handleNavigation = (view) => {
    // Clear the URL parameters before navigating
    window.history.replaceState({}, document.title, window.location.pathname);
    onNavigate(view);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="text-center mb-6">
          <QrCode className="mx-auto text-green-500 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-white mb-2">QR Scan Detected</h2>
          <p className="text-gray-400">Quick check-in/out for Muscle Art Fitness</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleQuickScan} className="space-y-6 mb-6">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Phone Number</label>
            <input 
              type="tel"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="Enter your phone number"
              value={credentials.phone}
              onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Password</label>
            <input 
              type="password"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Quick Check-In/Out'}
          </button>
        </form>

        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-400 text-center mb-4">Or continue with full login</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleNavigation('member-login')}
              className="bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold"
            >
              Member Login
            </button>
            <button 
              onClick={() => handleNavigation('member-register')}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all font-semibold"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanOptionsView;