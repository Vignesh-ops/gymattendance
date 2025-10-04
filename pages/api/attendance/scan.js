import { mongooseConnect } from '../../../lib/mongoose';
import Attendance from '../../../models/Attendance';
import Member from '../../../models/Member';
import { authMiddleware } from '../../../lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'gym_attendance_secret_key_2024_production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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

    const memberId = member._id;
    const now = new Date();
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const currentTime = now.getTime();
    
    // Check for active session in the last 4 hours
    const fourHoursAgo = new Date(currentTime - (4 * 60 * 60 * 1000));
    
    const activeSession = await Attendance.findOne({
      memberId,
      inTime: { $gte: fourHoursAgo },
      outTime: { $exists: false }
    });

    if (activeSession) {
      // Mark exit (Check-out)
      const outTime = new Date();
      const duration = Math.floor((outTime - activeSession.inTime) / 1000);
      
      activeSession.outTime = outTime;
      activeSession.duration = duration;
      await activeSession.save();

      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);

      return res.json({
        success: true,
        message: `Check-out successful! Workout duration: ${hours}h ${minutes}m. Great session!`,
        type: 'check-out',
        duration,
        session: {
          inTime: activeSession.inTime,
          outTime: activeSession.outTime,
          duration
        }
      });
    } else {
      // Check if user has already completed 2 sessions today
      const todaySessions = await Attendance.find({
        memberId,
        date: today
      });

      // Allow maximum 2 sessions per day
      if (todaySessions.length >= 2) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 2 sessions per day allowed. Come back tomorrow!'
        });
      }

      // Check if last session ended less than 30 minutes ago
      if (todaySessions.length > 0) {
        const lastSession = todaySessions[todaySessions.length - 1];
        if (lastSession.outTime) {
          const timeSinceLastSession = currentTime - lastSession.outTime.getTime();
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (timeSinceLastSession < thirtyMinutes) {
            const minutesLeft = Math.ceil((thirtyMinutes - timeSinceLastSession) / 60000);
            return res.status(400).json({
              success: false,
              message: `Please wait ${minutesLeft} minutes before starting a new session.`
            });
          }
        }
      }

      // Create new check-in
      const attendance = new Attendance({
        memberId,
        inTime: now,
        date: today
      });

      await attendance.save();

      return res.json({
        success: true,
        message: `Check-in successful! Welcome to Muscle Art Fitness, ${member.name}. Have a great workout!`,
        type: 'check-in',
        session: {
          inTime: attendance.inTime
        }
      });
    }
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during check-in/out. Please try again.' 
    });
  }
}