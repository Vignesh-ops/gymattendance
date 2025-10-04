import jwt from 'jsonwebtoken';
import Member from '../models/Member';

const JWT_SECRET = process.env.JWT_SECRET || 'gym_attendance_secret_key_2024_production';

export const authMiddleware = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const member = await Member.findOne({ _id: decoded.id }).select('-password');
    
    if (!member) {
      return null;
    }

    return member;
  } catch (error) {
    return null;
  }
};

export const adminMiddleware = (member) => {
  return member && member.role === 'admin';
};