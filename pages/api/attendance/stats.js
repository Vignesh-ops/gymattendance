import { mongooseConnect } from '../../../lib/mongoose';
import Attendance from '../../../models/Attendance';
import Member from '../../../models/Member';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await mongooseConnect();

    // Authenticate user
    const member = await authMiddleware(req);
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    const [
      totalMembers,
      todayVisits,
      activeNow,
      avgDurationResult
    ] = await Promise.all([
      Member.countDocuments({ isActive: true }),
      Attendance.countDocuments({ date: today }),
      Attendance.countDocuments({ 
        date: today, 
        outTime: { $exists: false } 
      }),
      Attendance.aggregate([
        { 
          $match: { 
            duration: { $exists: true, $gt: 0 },
            date: today
          } 
        },
        { 
          $group: { 
            _id: null, 
            avgDuration: { $avg: '$duration' } 
          } 
        }
      ])
    ]);

    res.json({
      success: true,
      totalMembers,
      todayVisits,
      activeNow,
      avgDuration: avgDurationResult[0]?.avgDuration || 0
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching statistics.' 
    });
  }
}