import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member', 
    required: true,
    index: true
  },
  inTime: { 
    type: Date, 
    required: true,
    index: true
  },
  outTime: { 
    type: Date 
  },
  duration: { 
    type: Number,
    min: 0
  },
  date: { 
    type: String, 
    required: true,
    index: true
  }
}, {
  timestamps: true
});

attendanceSchema.index({ memberId: 1, date: 1 });
attendanceSchema.index({ date: 1, outTime: 1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);