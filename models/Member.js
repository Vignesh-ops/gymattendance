import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  joinDate: { 
    type: Date, 
    default: Date.now 
  },
  role: { 
    type: String, 
    enum: ['member', 'admin'],
    default: 'member' 
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

memberSchema.index({ phone: 1 });
memberSchema.index({ role: 1 });

export default mongoose.models.Member || mongoose.model('Member', memberSchema);