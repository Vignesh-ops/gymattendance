import { mongooseConnect } from '../../../lib/mongoose';
import Member from '../../../models/Member';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';


const JWT_SECRET = process.env.JWT_SECRET || 'gym_attendance_secret_key_2024_production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Validation
    await Promise.all([
      body('phone').trim().matches(/^\d{10}$/).run(req),
      body('password').notEmpty().run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array().map(err => err.msg)
      });
    }

    await mongooseConnect();

    const { phone, password } = req.body;
    console.log(phone,password)

    // Find admin member
    const member = await Member.findOne({ phone, role: 'admin' });
    console.log(member)

    if (!member) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid admin credentials.' 
      });
    }

    // Check password (commented as per your original code)
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid admin credentials.' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: member._id, role: member.role }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Admin login successful.',
      user: {
        _id: member._id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        role: member.role,
        joinDate: member.joinDate
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during admin login.' 
    });
  }
}