import { mongooseConnect } from '../../../lib/mongoose';
import Attendance from '../../../models/Attendance';
import { authMiddleware } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await mongooseConnect();

    // Authenticate user
    const member = await authMiddleware(req);
    if (!member) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login.' 
      });
    }

    const { limit = 50, skip = 0 } = req.query;

    const attendance = await Attendance.find({ memberId: member._id })
      .sort({ inTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const totalRecords = await Attendance.countDocuments({ memberId: member._id });

    res.json({
      success: true,
      attendance,
      pagination: {
        total: totalRecords,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: totalRecords > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching attendance records.' 
    });
  }
}