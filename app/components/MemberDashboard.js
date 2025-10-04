'use client';
import React, { useState, useEffect, useCallback } from 'react'; // Add useCallback
import { QrCode, Calendar } from 'lucide-react';

const MemberDashboard = ({ user, onScan, loading }) => {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({ 
    total: 0, 
    thisMonth: 0, 
    avgDuration: 0,
    todaySessions: 0 
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  // Move fetchAttendance inside useCallback to fix dependency
  const fetchAttendance = useCallback(async () => {
    try {
      const response = await fetch('/api/attendance/my-attendance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gymToken')}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setAttendance(data.attendance);
        calculateStats(data.attendance);
        
        const fourHoursAgo = new Date(Date.now() - (4 * 60 * 60 * 1000));
        const active = data.attendance.find(a => 
          !a.outTime && new Date(a.inTime) >= fourHoursAgo
        );
        setActiveSession(active);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
    setDataLoading(false);
  }, []); // Add dependencies if needed

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]); // Now fetchAttendance is stable

  // Rest of the component remains the same...
  const calculateStats = (records) => {
    const total = records.length;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todaySessions = records.filter(r => r.date === today).length;
    
    const thisMonth = records.filter(r => {
      const date = new Date(r.inTime);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const durations = records.filter(r => r.duration).map(r => r.duration);
    const avgDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    setStats({ total, thisMonth, avgDuration, todaySessions });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'In Progress';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.phone}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Member since {new Date(user.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                <p className="text-blue-300 text-sm font-semibold mb-1">Total Visits</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                <p className="text-green-300 text-sm font-semibold mb-1">This Month</p>
                <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
              </div>
            </div>

            {/* QR Scan Button */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <QrCode className="text-orange-500" />
                Quick Actions
              </h3>
              
              {activeSession ? (
                <div className="space-y-4">
                  <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                    <p className="text-green-300 font-semibold mb-2">Active Session</p>
                    <p className="text-white text-sm">Check-in: {formatTime(activeSession.inTime)}</p>
                  </div>
                  <button 
                    onClick={onScan}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <QrCode size={20} />
                    {loading ? 'Processing...' : 'Scan QR to Check Out'}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onScan}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <QrCode size={20} />
                  {loading ? 'Processing...' : 'Scan QR to Check In'}
                </button>
              )}
              
              <p className="text-gray-400 text-xs mt-3 text-center">
                Scan the QR code at gym entrance to check in/out
              </p>
            </div>

            {/* Avg Duration */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
              <p className="text-purple-300 text-sm font-semibold mb-1">Avg Duration</p>
              <p className="text-2xl font-bold text-white">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calendar className="text-orange-500" />
                Attendance History
              </h2>
              
              {dataLoading ? (
                <div className="text-center text-gray-400 py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-4">Loading your attendance...</p>
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <QrCode size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No attendance records yet</p>
                  <p className="text-sm mt-2">Scan the QR code at the gym to check in!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Check In</th>
                        <th className="py-3 px-4 text-left">Check Out</th>
                        <th className="py-3 px-4 text-left">Duration</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record, idx) => (
                        <tr key={record._id} className={`border-b border-gray-700 hover:bg-gray-700/30 ${idx === 0 ? 'bg-gray-700/20' : ''}`}>
                          <td className="py-4 px-4">
                            {formatDate(record.inTime)}
                          </td>
                          <td className="py-4 px-4 text-green-400 font-semibold">
                            {formatTime(record.inTime)}
                          </td>
                          <td className="py-4 px-4">
                            {record.outTime ? (
                              <span className="text-red-400 font-semibold">{formatTime(record.outTime)}</span>
                            ) : (
                              <span className="text-yellow-400">In Progress</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-semibold">
                            {formatDuration(record.duration)}
                          </td>
                          <td className="py-4 px-4">
                            {record.outTime ? (
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">Completed</span>
                            ) : (
                              <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold animate-pulse">Active</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;