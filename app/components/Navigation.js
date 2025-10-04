'use client';
import React, { useState } from 'react';
import { LogOut, Menu, X, Award } from 'lucide-react';

const Navigation = ({ user, onLogout, onNavigate }) => {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <nav className="bg-black/50 backdrop-blur-lg text-white sticky top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div 
            className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent cursor-pointer flex items-center gap-2"
            onClick={() => onNavigate('landing')}
          >
            <Award className="text-orange-500" size={28} />
            Muscle Art Fitness
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <>
                <button 
                  onClick={() => onNavigate('member-login')}
                  className="px-6 py-2 bg-orange-500 rounded-lg hover:bg-orange-600 transition-all font-semibold"
                >
                  Member Login
                </button>
                <button 
                  onClick={() => onNavigate('admin-login')}
                  className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Admin
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-300">Welcome, {user.name}</span>
                <button 
                  onClick={onLogout}
                  className="px-6 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-800">
            {!user ? (
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => { onNavigate('member-login'); setMobileMenu(false); }}
                  className="px-6 py-3 bg-orange-500 rounded-lg hover:bg-orange-600 transition-all font-semibold"
                >
                  Member Login
                </button>
                <button 
                  onClick={() => { onNavigate('admin-login'); setMobileMenu(false); }}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Admin
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { onLogout(); setMobileMenu(false); }}
                className="w-full px-6 py-3 bg-red-500 rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;