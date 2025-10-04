'use client';
import React from 'react';

const Notification = ({ message, type }) => {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className={`fixed top-20 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in max-w-md`}>
      {message}
    </div>
  );
};

export default Notification;