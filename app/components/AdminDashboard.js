'use client';
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Clock } from 'lucide-react';

const AdminDashboard = ({ user }) => {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    member: ''
  });
  const [activeTab, setActiveTab] = useState('attendance');

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('gymToken');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [attendanceRes, statsRes, membersRes] = await Promise.all([
        fetch(`/api/attendance/all?date=${filters.date}&member=${filters.member}`, { headers }),
        fetch('/api/attendance/stats', { headers }),
        fetch('/api/admin/members', { headers })
      ]);

      const [attendanceData, statsData, membersData] = await Promise.all([
        attendanceRes.json(),
        statsRes.json(),
        membersRes.json()
      ]);

      if (attendanceData.success) setAttendance(attendanceData.attendance);
      setStats(statsData);
      if (membersData.success) setMembers(membersData.members);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const markExit = async (attendanceId) => {
    try {
      const response = await fetch(`/api/attendance/mark-exit/${attendanceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gymToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to mark exit:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'Active';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Users className="text-orange-500" />
          Admin Dashboard
        </h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-300 font-semibold">Total Members</h3>
              <Users className="text-blue-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalMembers || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-300 font-semibold">Today's Visits</h3>
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{stats.todayVisits || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-orange-300 font-semibold">Active Now</h3>
              <Clock className="text-orange-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">{stats.activeNow || 0}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-300 font-semibold">Avg Duration</h3>
              <Clock className="text-purple-400" size={24} />
            </div>
            <p className="text-4xl font-bold text-white">
              {stats.avgDuration ? formatDuration(stats.avgDuration) : '0h 0m'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'attendance'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              Attendance Records
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                activeTab === 'members'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              All Members
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'attendance' && (
              <>
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      value={filters.date}
                      onChange={(e) => setFilters({...filters, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2 font-semibold">Search Member</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      placeholder="Phone or name"
                      value={filters.member}
                      onChange={(e) => setFilters({...filters, member: e.target.value})}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => setFilters({ date: new Date().toISOString().split('T')[0], member: '' })}
                      className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Attendance Table */}
                {loading ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4">Loading attendance data...</p>
                  </div>
                ) : attendance.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p className="text-lg">No attendance records found</p>
                    <p className="text-sm mt-2">Try changing the filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-white">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-3 px-4 text-left">Member</th>
                          <th className="py-3 px-4 text-left">Phone</th>
                          <th className="py-3 px-4 text-left">Check In</th>
                          <th className="py-3 px-4 text-left">Check Out</th>
                          <th className="py-3 px-4 text-left">Duration</th>
                          <th className="py-3 px-4 text-left">Status</th>
                          <th className="py-3 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.map((record) => (
                          <tr key={record._id} className="border-b border-gray-700 hover:bg-gray-700/30">
                            <td className="py-4 px-4 font-semibold">{record.memberId?.name || 'N/A'}</td>
                            <td className="py-4 px-4 text-gray-400">{record.memberId?.phone || 'N/A'}</td>
                            <td className="py-4 px-4 text-green-400 font-semibold">
                              {new Date(record.inTime).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-4 px-4">
                              {record.outTime ? (
                                <span className="text-red-400 font-semibold">
                                  {new Date(record.outTime).toLocaleString('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              ) : (
                                <span className="text-yellow-400">Active</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-bold">
                              {formatDuration(record.duration)}
                            </td>
                            <td className="py-4 px-4">
                              {record.outTime ? (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">Completed</span>
                              ) : (
                                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold animate-pulse">Active</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              {!record.outTime && (
                                <button 
                                  onClick={() => markExit(record._id)}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-all font-semibold"
                                >
                                  Mark Exit
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'members' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">All Registered Members</h3>
                {loading ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4">Loading members...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div key={member._id} className="bg-gray-700/30 rounded-xl p-4 border border-gray-600 hover:border-orange-500 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{member.name}</h4>
                            <p className="text-gray-400 text-sm">{member.phone}</p>
                          </div>
                        </div>
                        {member.email && (
                          <p className="text-gray-400 text-sm mb-2">{member.email}</p>
                        )}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            member.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-300' 
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;