import { mongooseConnect } from '../../../lib/mongoose';
import Member from '../../../models/Member';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

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

    // Find member
    const member = await Member.findOne({ phone, isActive: true });
    if (!member) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number or password.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number or password.' 
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
      message: 'Login successful. Welcome back!',
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
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login. Please try again.' 
    });
  }
}