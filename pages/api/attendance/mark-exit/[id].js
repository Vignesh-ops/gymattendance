import { mongooseConnect } from '../../../../lib/mongoose';  // This one needs 4 levels!
import Attendance from '../../../../models/Attendance';
import { authMiddleware } from '../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
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

    const { id } = req.query;

    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Attendance record not found.' 
      });
    }

    if (attendance.outTime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Member has already checked out.' 
      });
    }

    const outTime = new Date();
    const duration = Math.floor((outTime - attendance.inTime) / 1000);

    attendance.outTime = outTime;
    attendance.duration = duration;
    await attendance.save();

    res.json({
      success: true,
      message: 'Exit marked successfully.',
      duration
    });
  } catch (error) {
    console.error('Mark exit error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error marking exit.' 
    });
  }
}