'use client';
import React, { useState } from 'react';
import { QrCode } from 'lucide-react';

const LoginView = ({ onLogin, type, onNavigate, qrScanPending }) => {
  const [credentials, setCredentials] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'admin' ? '/api/auth/admin-login' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Login failed. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
        {qrScanPending && (
          <div className="bg-orange-500/20 border border-orange-500 text-orange-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <QrCode size={20} />
              <span className="font-semibold">QR Scan Pending</span>
            </div>
            <p className="text-sm mt-1">Login to complete your check-in/out</p>
          </div>
        )}
        
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          {type === 'admin' ? 'Admin Login' : 'Member Login'}
        </h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Phone Number
            </label>
            <input 
              type="tel"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter your 10-digit phone number"
              value={credentials.phone}
              onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
              required
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Password
            </label>
            <input 
              type="password"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 transform hover:scale-105"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {type === 'member' && onNavigate && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => onNavigate('member-register')}
              className="text-orange-500 hover:text-orange-400 font-semibold"
            >
              Don&apos;t have an account? Register here
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginView;