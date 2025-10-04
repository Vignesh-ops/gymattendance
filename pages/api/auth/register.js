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
      body('name').trim().notEmpty().isLength({ min: 2 }).run(req),
      body('phone').trim().matches(/^\d{10}$/).run(req),
      body('password').isLength({ min: 6 }).run(req),
      body('email').optional().isEmail().run(req)
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

    const { name, phone, email, password } = req.body;

    // Check if member exists
    const existingMember = await Member.findOne({ phone });
    if (existingMember) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create member
    const member = new Member({
      name,
      phone,
      email: email || '',
      password: hashedPassword
    });

    await member.save();

    // Generate token
    const token = jwt.sign(
      { id: member._id, role: member.role }, 
      JWT_SECRET, 
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Muscle Art Fitness.',
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
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration. Please try again.' 
    });
  }
}