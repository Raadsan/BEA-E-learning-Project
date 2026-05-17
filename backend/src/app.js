import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import classRoutes from './routes/classRoutes.js';
import programRoutes from './routes/programRoutes.js';
import subprogramRoutes from './routes/subprogramRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import paymentPackageRoutes from './routes/paymentPackageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import courseTimelineRoutes from './routes/courseTimelineRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import academicCalendarRoutes from './routes/academicCalendarRoutes.js';
import classScheduleRoutes from './routes/classScheduleRoutes.js';
import ieltsToeflRoutes from './routes/ieltsToeflRoutes.js';
import proficiencyTestRoutes from './routes/proficiencyTestRoutes.js';
import placementTestRoutes from './routes/placementTestRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import testimonialsRoutes from './routes/testimonialsRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import freezingRequestRoutes from './routes/freezingRequestRoutes.js';
import levelUpRequestRoutes from './routes/levelUpRequestRoutes.js';
import sessionRequestRoutes from './routes/sessionRequestRoutes.js';
import studentReviewRoutes from './routes/studentReviewRoutes.js';
import teacherReviewRoutes from './routes/teacherReviewRoutes.js';
import certificateAdminRoutes from './routes/certificateAdminRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import learningHoursRoutes from './routes/learningHoursRoutes.js';
import proficiencyTestStudentsRoutes from './routes/proficiencyTestStudentsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import waafiRoutes from './routes/waafiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// === Route Registration ===
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/subprograms', subprogramRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-packages', paymentPackageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/academic-calendar', academicCalendarRoutes);
app.use('/api/class-schedules', classScheduleRoutes);
app.use('/api/placement-tests', placementTestRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/level-up-requests', levelUpRequestRoutes);
app.use('/api/session-requests', sessionRequestRoutes);
app.use('/api/student-reviews', studentReviewRoutes);
app.use('/api/teacher-reviews', teacherReviewRoutes);
app.use('/api/certificate-admin', certificateAdminRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/learning-hours', learningHoursRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waafi', waafiRoutes);
app.use('/api/reports', reportRoutes);

// Dual mount for routing differences between frontend versions
app.use('/api/ielts', ieltsToeflRoutes);
app.use('/api/ielts-toefl', ieltsToeflRoutes);

app.use('/api/proficiency-tests', proficiencyTestRoutes);

app.use('/api/proficiency-students', proficiencyTestStudentsRoutes);
app.use('/api/proficiency-test-students', proficiencyTestStudentsRoutes);

app.use('/api/course-timeline', courseTimelineRoutes);
app.use('/api/course-timelines', courseTimelineRoutes);

app.use('/api/freezing-requests', freezingRequestRoutes);

// Root Route
app.get('/', (req, res) => {
    res.send('BEA E-Learning Backend is running (Prisma Organized Version)');
});

// Static uploads serve
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

export default app;
