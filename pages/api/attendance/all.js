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

    const { date, member: memberFilter, limit = 100 } = req.query;
    let filter = {};

    if (date) {
      filter.date = date;
    }

    if (memberFilter) {
      const members = await Member.find({ 
        $or: [
          { phone: { $regex: memberFilter, $options: 'i' } },
          { name: { $regex: memberFilter, $options: 'i' } }
        ]
      }).select('_id');
      filter.memberId = { $in: members.map(m => m._id) };
    }

    const attendance = await Attendance.find(filter)
      .populate('memberId', 'name phone email')
      .sort({ inTime: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      attendance,
      count: attendance.length
    });
  } catch (error) {
    console.error('All attendance fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance records.' 
    });
  }
}