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
app.use('/api/admin', adminRoutes);

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
