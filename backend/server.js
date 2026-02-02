import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { startReminderWorker } from './workers/proficiencyReminderWorker.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import ieltsToeflRoutes from './routes/ieltsToeflRoutes.js';
import proficiencyTestRoutes from './routes/proficiencyTestRoutes.js'; // The exam itself
import proficiencyTestStudentsRoutes from './routes/proficiencyTestStudentsRoutes.js'; // The new candidate registration
import placementTestRoutes from './routes/placementTestRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import programRoutes from './routes/programRoutes.js';
import subprogramRoutes from './routes/subprogramRoutes.js';
import classRoutes from './routes/classRoutes.js';
import sessionRequestRoutes from './routes/sessionRequestRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentPackageRoutes from './routes/paymentPackageRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import userRoutes from './routes/userRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import freezingRoutes from './routes/freezingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import courseTimelineRoutes from './routes/courseTimelineRoutes.js';
import testimonialsRoutes from './routes/testimonialsRoutes.js';
import teacherReviewRoutes from './routes/teacherReviewRoutes.js';
import studentReviewRoutes from './routes/studentReviewRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import levelUpRequestRoutes from './routes/levelUpRequestRoutes.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads static serve
app.use('/uploads', express.static('uploads'));

// Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/ielts-toefl', ieltsToeflRoutes);
app.use('/api/proficiency-tests', proficiencyTestRoutes); // Exam management
app.use('/api/proficiency-test-students', proficiencyTestStudentsRoutes); // New "Certificate Only" candidates
app.use('/api/placement-tests', placementTestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subprograms', subprogramRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/session-requests', sessionRequestRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/payment-packages', paymentPackageRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/freezing-requests', freezingRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/course-timeline', courseTimelineRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/teacher-reviews', teacherReviewRoutes);
app.use('/api/student-reviews', studentReviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/level-up-requests', levelUpRequestRoutes);



// Root Route
app.get('/', (req, res) => {
    res.send('BEA E-Learning Backend is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Start Background Workers
    startReminderWorker();
});
