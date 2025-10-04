import { mongooseConnect } from '../../../lib/mongoose';  // Fixed from ../../../../ to ../../../
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

    const { search, limit = 100 } = req.query;
    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await Member.find(filter)
      .select('-password')
      .sort({ joinDate: -1 })
      .limit(parseInt(limit))
      .lean();
    const totalMembers = await Member.countDocuments(filter);

    res.json({
      success: true,
      members,
      total: totalMembers
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching members.' 
    });
  }
}