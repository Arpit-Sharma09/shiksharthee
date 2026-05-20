const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');


const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'shiksharthee_secret_key';

// Automatically save to MongoDB Atlas when data changes
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    res.send = originalSend;
    const result = res.send.call(this, body);
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      if (typeof saveToDatabase === 'function') {
        saveToDatabase();
      }
    }
    return result;
  };
  next();
});

// ═══════════════════════════════════════════════
// IN-MEMORY DATABASE
// ═══════════════════════════════════════════════
let users = [];
let courses = [
  { 
    id: 1, title: 'Web Development', description: 'Build responsive websites and web apps from scratch. Covers HTML, CSS, JavaScript.', instructor: 'Mr. Sharma', price: 499, category: 'Web Development', level: 'Beginner', duration: '32 hours, 96 lectures', language: 'Hindi', videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE', totalLessons: 3, enrolled: 0,
    sections: [
      {
        id: 1, title: 'Introduction to Web', 
        lessons: [
          { id: 101, title: 'Introduction to HTML', duration: '12:45 min', videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg' },
          { id: 102, title: 'Setting up Environment', duration: '08:30 min', videoUrl: 'https://www.youtube.com/embed/kUMe1FH4CGY' },
          { id: 103, title: 'Your First Web Page', duration: '10:20 min', videoUrl: 'https://www.youtube.com/embed/mU6anWqZJcc' }
        ]
      }
    ]
  },
  { 
    id: 2, title: 'Database Management', description: 'Learn database design, SQL queries, normalization and management systems.', instructor: 'Ms. Verma', price: 399, category: 'Database', level: 'Intermediate', duration: '20 hours, 60 lectures', language: 'Hindi', videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', totalLessons: 2, enrolled: 0,
    sections: [
      {
        id: 1, title: 'Database Basics', 
        lessons: [
          { id: 201, title: 'What is a Database?', duration: '10:00 min', videoUrl: 'https://www.youtube.com/embed/wR0jg0eQsZA' },
          { id: 202, title: 'SQL vs NoSQL', duration: '15:20 min', videoUrl: 'https://www.youtube.com/embed/ZS_kXvOeQ5Y' }
        ]
      }
    ]
  },
  { 
    id: 3, title: 'JavaScript Basics', description: 'Master JavaScript fundamentals, ES6+, DOM manipulation and APIs.', instructor: 'Mr. Singh', price: 299, category: 'JavaScript', level: 'Beginner', duration: '15 hours, 45 lectures', language: 'Hinglish', videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk', totalLessons: 2, enrolled: 0,
    sections: [
      {
        id: 1, title: 'JS Fundamentals', 
        lessons: [
          { id: 301, title: 'Variables and Data Types', duration: '11:15 min', videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk' },
          { id: 302, title: 'Functions and Scope', duration: '14:40 min', videoUrl: 'https://www.youtube.com/embed/N8ap4k_1QEQ' }
        ]
      }
    ]
  },
  { 
    id: 4, title: 'CSS Fundamentals', description: 'Learn CSS3, Flexbox, Grid, animations and responsive design.', instructor: 'Mr. Sharma', price: 299, category: 'Web Development', level: 'Beginner', duration: '10 hours, 30 lectures', language: 'Hindi', videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc', totalLessons: 2, enrolled: 0,
    sections: [
      {
        id: 1, title: 'CSS Styling', 
        lessons: [
          { id: 401, title: 'Introduction to CSS', duration: '09:30 min', videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc' },
          { id: 402, title: 'Flexbox Basics', duration: '18:50 min', videoUrl: 'https://www.youtube.com/embed/fYq5PXgSsbE' }
        ]
      }
    ]
  },
  { 
    id: 5, title: 'React for Beginners', description: 'Build modern UIs with React.js, hooks, state management and routing.', instructor: 'Ms. Verma', price: 499, category: 'React', level: 'Intermediate', duration: '25 hours, 75 lectures', language: 'Hinglish', videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8', totalLessons: 2, enrolled: 0,
    sections: [
      {
        id: 1, title: 'React Basics', 
        lessons: [
          { id: 501, title: 'What is React?', duration: '12:00 min', videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8' },
          { id: 502, title: 'Components and Props', duration: '16:30 min', videoUrl: 'https://www.youtube.com/embed/RGKi6LSPDLU' }
        ]
      }
    ]
  },
  { 
    id: 6, title: 'UI/UX Design', description: 'Design beautiful interfaces using Figma, user research and prototyping.', instructor: 'Mr. Sharma', price: 399, category: 'Design', level: 'Beginner', duration: '18 hours, 54 lectures', language: 'Hindi', videoUrl: 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU', totalLessons: 2, enrolled: 0,
    sections: [
      {
        id: 1, title: 'Design Fundamentals', 
        lessons: [
          { id: 601, title: 'Introduction to UI/UX', duration: '14:20 min', videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU' },
          { id: 602, title: 'Figma Basics', duration: '20:10 min', videoUrl: 'https://www.youtube.com/embed/jk1T0CdLxwU' }
        ]
      }
    ]
  },
];
let enrollments = []; // { id, userId, courseId, enrolledAt, amountPaid }
let progress = [];    // { userId, courseId, lessonsCompleted, lastUpdated }
let feedback = [];

let assignments = [
  { id: 1, courseId: 1, title: 'Build a Personal Portfolio', description: 'Create a personal portfolio using HTML and CSS.', timeLimit: '48 hours', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), maxMarks: 100, createdAt: new Date() },
  { id: 2, courseId: 3, title: 'JavaScript Calculator', description: 'Build a working calculator using vanilla JavaScript.', timeLimit: '24 hours', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), maxMarks: 50, createdAt: new Date() }
];
let submissions = []; // { id, assignmentId, studentId, answer, submittedAt, status: 'pending'|'graded', marks }

let quizzes = []; // { id, studentId, topic, score, totalQuestions, createdAt }
let notifications = [
  { id: 1, title: 'Welcome to Shiksharthee!', message: 'Explore our courses and start learning today.', type: 'info', date: new Date().toISOString() },
  { id: 2, title: 'New Course Available', message: 'The React for Beginners course is now live.', type: 'success', date: new Date().toISOString() }
];

let nextCourseId = 7;
let nextEnrollmentId = 1;
let nextSubmissionId = 1;
let nextQuizId = 1;
let nextNotificationId = 3;

// Moved from later in the file for MongoDB persistence grouping
let announcements = [
  { id: 1, title: 'Welcome to Shiksharthee!', message: 'Explore our new courses and features.', fileUrl: '', type: 'info', date: new Date(), author: 'Admin' },
  { id: 2, title: 'Final Exam Schedule', message: 'The schedule for the final exams has been posted.', fileUrl: 'https://example.com/exam-schedule.pdf', type: 'warning', date: new Date(), author: 'Admin' }
];
let messages = [];
let conversations = [];
let nextAnnouncementId = 3;

// ═══════════════════════════════════════════════
// MONGODB ATLAS SYNCHRONIZATION LAYER
// ═══════════════════════════════════════════════

const stateSchema = new mongoose.Schema({
  key: { type: String, default: 'main_state' },
  users: { type: Array, default: [] },
  courses: { type: Array, default: [] },
  enrollments: { type: Array, default: [] },
  progress: { type: Array, default: [] },
  feedback: { type: Array, default: [] },
  assignments: { type: Array, default: [] },
  submissions: { type: Array, default: [] },
  quizzes: { type: Array, default: [] },
  notifications: { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  conversations: { type: Array, default: [] },
  messages: { type: Array, default: [] },
  nextCourseId: { type: Number, default: 7 },
  nextEnrollmentId: { type: Number, default: 1 },
  nextSubmissionId: { type: Number, default: 1 },
  nextQuizId: { type: Number, default: 1 },
  nextNotificationId: { type: Number, default: 3 },
  nextAnnouncementId: { type: Number, default: 3 }
});
const AppState = mongoose.model('AppState', stateSchema);

// Individual Collections for Compass/Atlas visualization
const UserSchemaObj = new mongoose.Schema({
  fullName: String,
  email: String,
  role: String,
  createdAt: Date,
  avatar: String
}, { strict: false });
const CourseSchemaObj = new mongoose.Schema({
  title: String,
  description: String,
  instructor: String,
  price: Number,
  category: String
}, { strict: false });
const FeedbackSchemaObj = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  subject: String,
  status: String,
  createdAt: Date
}, { strict: false });

const UserCollection = mongoose.model('UserCollection', UserSchemaObj, 'users');
const CourseCollection = mongoose.model('CourseCollection', CourseSchemaObj, 'courses');
const FeedbackCollection = mongoose.model('FeedbackCollection', FeedbackSchemaObj, 'feedbacks');

const saveToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    return; // Skip sync if not connected to avoid buffering timeouts
  }
  try {
    // 1. Save master state
    await AppState.findOneAndUpdate(
      { key: 'main_state' },
      {
        users, courses, enrollments, progress, feedback, assignments, submissions, quizzes, notifications, announcements, conversations, messages,
        nextCourseId, nextEnrollmentId, nextSubmissionId, nextQuizId, nextNotificationId, nextAnnouncementId
      },
      { upsert: true, new: true }
    );
    
    // 2. Sync visual collections for MongoDB Compass / Atlas view
    await UserCollection.deleteMany({});
    if (users.length > 0) {
      await UserCollection.insertMany(users.map(u => ({ ...u, _id: undefined })));
    }
    
    await CourseCollection.deleteMany({});
    if (courses.length > 0) {
      await CourseCollection.insertMany(courses.map(c => ({ ...c, _id: undefined })));
    }
    
    await FeedbackCollection.deleteMany({});
    if (feedback.length > 0) {
      await FeedbackCollection.insertMany(feedback.map(f => ({ ...f, _id: undefined })));
    }
    
    console.log('💾 Database successfully synchronized with MongoDB Atlas!');
  } catch (err) {
    console.error('❌ Error synchronizing with MongoDB Atlas:', err.message);
  }
};

const initDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/shiksharthee';
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    // Load state
    const state = await AppState.findOne({ key: 'main_state' });
    if (state) {
      console.log('📦 Loading existing application state from MongoDB Atlas...');
      users = state.users || [];
      courses = state.courses || [];
      enrollments = state.enrollments || [];
      progress = state.progress || [];
      feedback = state.feedback || [];
      assignments = state.assignments || [];
      submissions = state.submissions || [];
      quizzes = state.quizzes || [];
      notifications = state.notifications || [];
      announcements = state.announcements || [];
      conversations = state.conversations || [];
      messages = state.messages || [];
      nextCourseId = state.nextCourseId || 7;
      nextEnrollmentId = state.nextEnrollmentId || 1;
      nextSubmissionId = state.nextSubmissionId || 1;
      nextQuizId = state.nextQuizId || 1;
      nextNotificationId = state.nextNotificationId || 3;
      nextAnnouncementId = state.nextAnnouncementId || 3;
      console.log(`🎉 Loaded ${users.length} users, ${courses.length} courses, and other state data from Atlas!`);
    } else {
      console.log('🆕 No existing state found in Atlas. Initializing database with seed data...');
      await saveToDatabase();
    }
  } catch (err) {
    console.error('❌ MongoDB Connection/Init error:', err.message);
    console.log('⚠️ Falling back to Local In-Memory Mode with Seed Users...');
    try {
      const studentHash = await bcrypt.hash('password123', 10);
      const instructorHash = await bcrypt.hash('password123', 10);
      const adminHash = await bcrypt.hash('password123', 10);
      users = [
        {
          id: 'student-seed',
          fullName: 'Test Student',
          email: 'student@test.com',
          password: studentHash,
          role: 'student',
          createdAt: new Date(),
          avatar: 'S'
        },
        {
          id: 'instructor-seed',
          fullName: 'Test Instructor',
          email: 'instructor@test.com',
          password: instructorHash,
          role: 'instructor',
          createdAt: new Date(),
          avatar: 'I'
        },
        {
          id: 'admin-seed',
          fullName: 'Test Admin',
          email: 'admin@test.com',
          password: adminHash,
          role: 'admin',
          createdAt: new Date(),
          avatar: 'A'
        }
      ];
      console.log('✅ Local In-Memory Seed Users initialized successfully:');
      console.log('   - Student: student@test.com | password123');
      console.log('   - Instructor: instructor@test.com | password123');
      console.log('   - Admin: admin@test.com | password123');
    } catch (hashErr) {
      console.error('❌ Error hashing password for local seeds:', hashErr.message);
    }
  }
};

// ═══════════════════════════════════════════════
// HELPER: Verify JWT middleware
// ═══════════════════════════════════════════════
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token, access denied' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};

// ═══════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });
    if (users.find(u => u.email === email))
      return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      fullName, email,
      password: hashedPassword,
      role: role || 'student',
      createdAt: new Date(),
      avatar: fullName.charAt(0).toUpperCase()
    };
    users.push(newUser);
    res.status(201).json({ message: 'Registration successful! Please login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: 'No account found with this email' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ user: { id: user.id, role: user.role } }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

// ═══════════════════════════════════════════════
// COURSE ROUTES
// ═══════════════════════════════════════════════
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === Number(req.params.id));
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

app.post('/api/courses', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can add courses' });
  const { title, description, instructor, price, category, level, duration, language, videoUrl } = req.body;
  if (!title || !description || !instructor || !price)
    return res.status(400).json({ message: 'Title, description, instructor and price are required' });

  // YouTube Embed URL Formatter helper
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get('v');
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        return url;
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      console.error('Error parsing video URL:', e.message);
    }
    return url;
  };

  const formattedVideoUrl = getEmbedUrl(videoUrl);

  // Auto-generate sections & lessons so the course is playable in the Learning player
  const defaultSections = videoUrl ? [
    {
      id: Date.now(),
      title: 'Course Introduction & Lessons',
      lessons: [
        {
          id: Date.now() + 1,
          title: 'Introduction & Lecture Video',
          duration: duration || '10:00 min',
          videoUrl: formattedVideoUrl
        }
      ]
    }
  ] : [];

  const newCourse = {
    id: nextCourseId++, 
    title, 
    description, 
    instructor,
    price: Number(price), 
    category: category || 'General',
    level: level || 'Beginner', 
    duration: duration || '1 hour',
    language: language || 'English', 
    videoUrl: formattedVideoUrl,
    totalLessons: defaultSections.length > 0 ? 1 : 0,
    sections: defaultSections,
    enrolled: 0, 
    createdAt: new Date()
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
});

app.delete('/api/courses/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Only admins can delete courses' });
  const id = Number(req.params.id);
  courses = courses.filter(c => c.id !== id);
  enrollments = enrollments.filter(e => e.courseId !== id);
  progress = progress.filter(p => p.courseId !== id);
  res.json({ message: 'Course deleted successfully' });
});

// ═══════════════════════════════════════════════
// ENROLLMENT ROUTES
// ═══════════════════════════════════════════════
// Enroll in a course
app.post('/api/enrollments', authMiddleware, (req, res) => {
  const { courseId } = req.body;
  const cId = Number(courseId);
  const course = courses.find(c => c.id === cId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const existing = enrollments.find(e => e.userId === req.user.id && e.courseId === cId);
  if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

  const enrollment = {
    id: nextEnrollmentId++,
    userId: req.user.id,
    courseId: cId,
    amountPaid: course.price,
    enrolledAt: new Date()
  };
  enrollments.push(enrollment);

  // Update course enrollment count
  course.enrolled = (course.enrolled || 0) + 1;

  // Initialize progress for user
  progress.push({ userId: req.user.id, courseId: cId, lessonsCompleted: 0, lastUpdated: new Date() });

  res.status(201).json({ message: `Successfully enrolled in ${course.title}!`, enrollment });
});

// Get enrollments for logged-in user
app.get('/api/enrollments/my', authMiddleware, (req, res) => {
  const userEnrollments = enrollments.filter(e => e.userId === req.user.id);
  const enriched = userEnrollments.map(e => {
    const course = courses.find(c => c.id === e.courseId);
    const prog = progress.find(p => p.userId === req.user.id && p.courseId === e.courseId);
    const pct = prog && course?.totalLessons
      ? Math.round((prog.lessonsCompleted / course.totalLessons) * 100)
      : 0;
    return { ...e, course, progressPct: pct, lessonsCompleted: prog?.lessonsCompleted || 0 };
  });
  res.json(enriched);
});

// Check if user is enrolled in a specific course
app.get('/api/enrollments/check/:courseId', authMiddleware, (req, res) => {
  const cId = Number(req.params.courseId);
  const enrolled = !!enrollments.find(e => e.userId === req.user.id && e.courseId === cId);
  res.json({ enrolled });
});

// ═══════════════════════════════════════════════
// PROGRESS ROUTES
// ═══════════════════════════════════════════════
// Update lesson progress
app.put('/api/progress', authMiddleware, (req, res) => {
  const { courseId, lessonsCompleted } = req.body;
  const cId = Number(courseId);
  const course = courses.find(c => c.id === cId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const prog = progress.find(p => p.userId === req.user.id && p.courseId === cId);
  if (!prog) return res.status(400).json({ message: 'Not enrolled in this course' });

  prog.lessonsCompleted = Math.min(lessonsCompleted, course.totalLessons);
  prog.lastUpdated = new Date();

  const pct = Math.round((prog.lessonsCompleted / course.totalLessons) * 100);
  res.json({ ...prog, progressPct: pct, course });
});

// Get progress for logged-in user
app.get('/api/progress/my', authMiddleware, (req, res) => {
  const userProgress = progress.filter(p => p.userId === req.user.id);
  const userSubmissions = submissions.filter(s => s.studentId === req.user.id);
  const userQuizzes = quizzes.filter(q => q.studentId === req.user.id);

  const enriched = userProgress.map(p => {
    const course = courses.find(c => c.id === p.courseId);
    const pct = course?.totalLessons ? Math.round((p.lessonsCompleted / course.totalLessons) * 100) : 0;
    return { ...p, course, progressPct: pct };
  });

  res.json({
    courses: enriched,
    assignments: userSubmissions,
    quizzes: userQuizzes
  });
});

app.get('/api/progress/student/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor')
    return res.status(403).json({ message: 'Only admin or instructor can view this' });
  const sId = req.params.id;
  const userProgress = progress.filter(p => p.userId === sId);
  const userSubmissions = submissions.filter(s => s.studentId === sId);
  const userQuizzes = quizzes.filter(q => q.studentId === sId);
  res.json({ courses: userProgress, assignments: userSubmissions, quizzes: userQuizzes });
});

app.get('/api/users/students', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor')
    return res.status(403).json({ message: 'Access denied' });
  const students = users.filter(u => u.role === 'student').map(u => ({ id: u.id, fullName: u.fullName, email: u.email }));
  res.json(students);
});

// ═══════════════════════════════════════════════
// ASSIGNMENT ROUTES
// ═══════════════════════════════════════════════
app.get('/api/assignments', authMiddleware, (req, res) => {
  res.json(assignments);
});

app.post('/api/assignments', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Only admin or instructor can create assignments' });

    const { title, description, timeLimit, maxMarks } = req.body;
    if (!title || !maxMarks) {
      return res.status(400).json({ message: 'Title and Max Marks are required' });
    }

    const nextId = Math.max(...assignments.map(a => a.id), 0) + 1;
    const assignment = {
      id: nextId,
      title,
      description: description || '',
      timeLimit: timeLimit || '7 days',
      maxMarks: Number(maxMarks),
      createdBy: req.user.id,
      createdAt: new Date()
    };

    assignments.push(assignment);
    await saveToDatabase();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.get('/api/assignments/my', authMiddleware, (req, res) => {
  const mySubmissions = submissions.filter(s => s.studentId === req.user.id);
  res.json(mySubmissions);
});

app.post('/api/assignments/submit', authMiddleware, async (req, res) => {
  try {
    const { assignmentId, answer, fileUrl } = req.body;
    const assignment = assignments.find(a => a.id === Number(assignmentId));
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    
    const existing = submissions.find(s => s.assignmentId === assignment.id && s.studentId === req.user.id);
    if (existing) return res.status(400).json({ message: 'Already submitted' });

    const submission = {
      id: nextSubmissionId++,
      assignmentId: assignment.id,
      studentId: req.user.id,
      answer,
      fileUrl: fileUrl || null,
      submittedAt: new Date(),
      status: 'pending',
      marks: null,
      maxMarks: assignment.maxMarks
    };
    submissions.push(submission);
    await saveToDatabase();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

app.get('/api/assignments/submissions', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor')
    return res.status(403).json({ message: 'Only instructors can view submissions' });
  
  const enriched = submissions.map(s => {
    const student = users.find(u => u.id === s.studentId);
    const assignment = assignments.find(a => a.id === s.assignmentId);
    return { 
      ...s, 
      studentName: student?.fullName || 'Unknown Student', 
      studentEmail: student?.email || 'N/A',
      studentAvatar: student?.avatar || (student?.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'),
      assignmentTitle: assignment?.title || 'Unknown Assignment'
    };
  });
  res.json(enriched);
});

app.put('/api/assignments/grade/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor')
      return res.status(403).json({ message: 'Only instructors can grade' });

    const submission = submissions.find(s => s.id === Number(req.params.id));
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.marks = Number(req.body.marks);
    submission.status = 'graded';
    await saveToDatabase();
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ═══════════════════════════════════════════════
// QUIZ ROUTES (REAL QUESTIONS)
// ═══════════════════════════════════════════════
app.post('/api/quizzes/generate', authMiddleware, async (req, res) => {
  const { topic } = req.body;
  const lowerTopic = topic ? topic.toLowerCase() : '';
  
  let questions = [];
  let generatedWithAI = false;

  // Dynamically load dotenv and check the key to avoid server restart issues!
  require('dotenv').config();
  const activeKey = process.env.GEMINI_API_KEY;

  if (activeKey && activeKey !== 'dummy_key') {
    try {
      const dynamicGenAI = new GoogleGenerativeAI(activeKey);
      const model = dynamicGenAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Generate exactly 10 multiple-choice questions (MCQs) for a quiz on the topic: "${topic}".
Output must be in JSON format. The root of the JSON should be a JSON array of objects, where each object has the following structure:
{
  "id": 1,
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOption": 0, // 0-based index of the correct option in the options array (must be between 0 and 3)
  "explanation": "Why this option is correct."
}
Return only the raw JSON array. Do not include markdown code block formatting or backticks. Make it fully valid JSON.`;

      console.log(`[Gemini Quiz Gen] Generating questions for topic: "${topic}" using model gemini-2.5-flash...`);
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      
      let jsonText = text;
      if (jsonText.includes('```')) {
        const matches = jsonText.match(/```\w*([\s\S]*?)```/);
        if (matches && matches[1]) {
          jsonText = matches[1].trim();
        }
      }
      
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questions = parsed.map((q, idx) => ({
          id: idx + 1,
          question: q.question || `Concept question ${idx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 2 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: typeof q.correctOption === 'number' && q.correctOption >= 0 && q.correctOption < (q.options?.length || 4) ? q.correctOption : 0,
          explanation: q.explanation || 'No explanation provided.'
        }));
        generatedWithAI = true;
        console.log(`[Gemini Quiz Gen] Successfully generated 10 questions for topic "${topic}".`);
      }
    } catch (err) {
      console.error('[Gemini Quiz Gen Error] Failed to generate quiz questions via Gemini:', err);
      if (typeof text !== 'undefined') {
        console.error('[Gemini Quiz Gen Error] Raw response was:', text);
      }
    }
  } else {
    console.log('[Gemini Quiz Gen] No active GEMINI_API_KEY found in .env, falling back to static questions.');
  }
  if (!generatedWithAI) {
    if (lowerTopic.includes('react')) {
      questions = [
        { id: 1, question: 'What is React primarily used for?', options: ['Server-side scripting', 'Building user interfaces', 'Database management', 'Creating APIs'], correctOption: 1, explanation: 'React is a JavaScript library for building user interfaces.' },
        { id: 2, question: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctOption: 2, explanation: 'useState is the primary hook for managing state in functional components.' },
        { id: 3, question: 'What is JSX?', options: ['A styling language', 'A JavaScript syntax extension', 'A database query language', 'A new version of HTML'], correctOption: 1, explanation: 'JSX is a syntax extension for JavaScript that looks similar to XML or HTML.' },
        { id: 4, question: 'How do you pass data from a parent to a child component?', options: ['Using state', 'Using props', 'Using contexts', 'Using Redux'], correctOption: 1, explanation: 'Props (properties) are used to pass data from parent to child components.' },
        { id: 5, question: 'What does the useEffect hook do?', options: ['Renders UI', 'Manages state', 'Performs side effects', 'Creates variables'], correctOption: 2, explanation: 'useEffect allows you to perform side effects in functional components.' },
        { id: 6, question: 'What is the virtual DOM?', options: ['A direct copy of the real DOM', 'A lightweight JavaScript representation of the DOM', 'A database structure', 'A browser extension'], correctOption: 1, explanation: 'The virtual DOM is a programming concept where an ideal, or "virtual", representation of a UI is kept in memory.' },
        { id: 7, question: 'In React, keys are used to:', options: ['Encrypt data', 'Identify elements uniquely in a list', 'Unlock components', 'Define CSS classes'], correctOption: 1, explanation: 'Keys help React identify which items have changed, are added, or are removed.' },
        { id: 8, question: 'Which method is required in a class component?', options: ['componentDidMount', 'render()', 'constructor()', 'getDerivedStateFromProps'], correctOption: 1, explanation: 'The render() method is the only required method in a class component.' },
        { id: 9, question: 'What is a higher-order component (HOC)?', options: ['A component that renders a list', 'A function that takes a component and returns a new component', 'A component with state', 'The main App component'], correctOption: 1, explanation: 'An HOC is an advanced technique for reusing component logic.' },
        { id: 10, question: 'React is maintained primarily by:', options: ['Google', 'Microsoft', 'Meta (Facebook)', 'Twitter'], correctOption: 2, explanation: 'React was created and is maintained by Meta (Facebook).' }
      ];
    } else if (lowerTopic.includes('javascript') || lowerTopic.includes('js')) {
      questions = [
        { id: 1, question: 'Which of the following is used to declare a block-scoped variable in JavaScript?', options: ['var', 'let', 'constant', 'variable'], correctOption: 1, explanation: '"let" allows you to declare variables that are limited to the scope of a block statement.' },
        { id: 2, question: 'Which operator is used to compare both value and type?', options: ['==', '=', '===', '!='], correctOption: 2, explanation: 'The strict equality operator (===) checks whether its two operands are equal, returning a Boolean result.' },
        { id: 3, question: 'What is the output of "typeof null"?', options: ['"null"', '"undefined"', '"object"', '"number"'], correctOption: 2, explanation: 'In JavaScript, typeof null is an "object". This is considered a historical bug in the language.' },
        { id: 4, question: 'How do you create a function in JavaScript?', options: ['function myFunction()', 'create myFunction()', 'def myFunction()', 'fun myFunction()'], correctOption: 0, explanation: 'Functions are defined with the "function" keyword.' },
        { id: 5, question: 'What does JSON stand for?', options: ['JavaScript Object Notation', 'JavaScript Online Node', 'Java Standard Output Network', 'JavaScript Oriented Notation'], correctOption: 0, explanation: 'JSON stands for JavaScript Object Notation.' },
        { id: 6, question: 'Which method removes the last element from an array?', options: ['shift()', 'pop()', 'push()', 'slice()'], correctOption: 1, explanation: 'The pop() method removes the last element from an array and returns that element.' },
        { id: 7, question: 'What is a closure?', options: ['A closed window', 'A function bundled together with its lexical environment', 'A loop that never ends', 'A syntax error'], correctOption: 1, explanation: 'A closure is the combination of a function bundled together (enclosed) with references to its surrounding state.' },
        { id: 8, question: 'How can you add a comment in a JavaScript?', options: ['<!--This is a comment-->', '//This is a comment', '"This is a comment"', '*This is a comment*'], correctOption: 1, explanation: 'Single line comments start with //.' },
        { id: 9, question: 'Which built-in method returns the calling string value converted to lower case?', options: ['toLowerCase()', 'toLower()', 'changeCase(lower)', 'None of the above'], correctOption: 0, explanation: 'toLowerCase() returns the calling string value converted to lower case.' },
        { id: 10, question: 'What is the result of 1 + "1"?', options: ['2', '"11"', 'undefined', 'NaN'], correctOption: 1, explanation: 'When you add a number to a string, JavaScript converts the number to a string and concatenates them.' }
      ];
    } else {
      for (let i = 1; i <= 10; i++) {
        questions.push({
          id: i,
          question: `What is a core concept of ${topic || 'Computer Science'}?`,
          options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'All of the above'],
          correctOption: 3,
          explanation: `In general software engineering topics like ${topic || 'this'}, these principles apply broadly.`
        });
      }
    }
  }

  res.json({ topic, questions, generatedWithAI });
});

app.post('/api/quizzes/submit', authMiddleware, (req, res) => {
  const { topic, score, totalQuestions } = req.body;
  const quiz = {
    id: nextQuizId++,
    studentId: req.user.id,
    topic,
    score,
    totalQuestions,
    createdAt: new Date()
  };
  quizzes.push(quiz);
  res.status(201).json(quiz);
});

// ═══════════════════════════════════════════════
// NOTIFICATION ROUTES
// ═══════════════════════════════════════════════
app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'instructor')
    return res.status(403).json({ message: 'Only admins and instructors can create notifications' });
  const { title, message, type } = req.body;
  const newNotification = {
    id: nextNotificationId++,
    title, message, type: type || 'info',
    date: new Date().toISOString()
  };
  notifications.unshift(newNotification); // Add to beginning
  res.status(201).json(newNotification);
});

// ═══════════════════════════════════════════════
// ADMIN STATS (REAL-TIME)
// ═══════════════════════════════════════════════
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin only' });

  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
  const totalEnrollments = enrollments.length;
  const totalCourses = courses.length;

  // Monthly revenue (last 6 months)
  const now = new Date();
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const month = d.toLocaleString('default', { month: 'short' });
    const rev = enrollments
      .filter(e => new Date(e.enrolledAt) >= d && new Date(e.enrolledAt) < nextD)
      .reduce((sum, e) => sum + (e.amountPaid || 0), 0);
    const count = enrollments.filter(e => new Date(e.enrolledAt) >= d && new Date(e.enrolledAt) < nextD).length;
    monthlyRevenue.push({ month, revenue: rev, enrollments: count });
  }

  const recentEnrollments = enrollments.slice(-5).reverse().map(e => {
    const user = users.find(u => u.id === e.userId);
    const course = courses.find(c => c.id === e.courseId);
    return { ...e, user: user ? { fullName: user.fullName, email: user.email } : null, course };
  });

  res.json({
    totalStudents,
    totalInstructors,
    totalRevenue,
    totalEnrollments,
    totalCourses,
    avgRating: 4.7,
    monthlyRevenue,
    recentEnrollments,
    allUsers: users.map(({ password, ...u }) => u)
  });
});

// ═══════════════════════════════════════════════
// ANNOUNCEMENTS & MESSAGES & QUERIES DATA (Moved to top for MongoDB persistence)
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// ANNOUNCEMENT ROUTES
// ═══════════════════════════════════════════════
app.get('/api/announcements', authMiddleware, (req, res) => {
  res.json(announcements);
});

app.post('/api/announcements', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const { title, message, fileUrl, type } = req.body;
  const newAnn = {
    id: nextAnnouncementId++,
    title, message, fileUrl,
    type: type || 'info',
    date: new Date(),
    author: 'Admin'
  };
  announcements.unshift(newAnn);
  res.status(201).json(newAnn);
});

// ═══════════════════════════════════════════════
// MESSAGE ROUTES (Basic Chat)
// ═══════════════════════════════════════════════
app.get('/api/messages/conversations', authMiddleware, (req, res) => {
  const userConvos = conversations.filter(c => c.participants.includes(req.user.id));
  const detailedConvos = userConvos.map(c => {
    const otherId = c.participants.find(p => p !== req.user.id);
    const otherUser = users.find(u => u.id === otherId);
    return { ...c, otherUser: otherUser ? { id: otherUser.id, fullName: otherUser.fullName, avatar: otherUser.avatar, role: otherUser.role } : null };
  });
  res.json(detailedConvos);
});

app.get('/api/messages/:convoId', authMiddleware, (req, res) => {
  const convoMessages = messages.filter(m => m.convoId === parseInt(req.params.convoId));
  res.json(convoMessages);
});

app.post('/api/messages/send', authMiddleware, (req, res) => {
  const { recipientId, text, convoId } = req.body;
  let activeConvoId = convoId;

  if (!activeConvoId) {
    // Check if convo already exists
    const existing = conversations.find(c => c.participants.includes(req.user.id) && c.participants.includes(recipientId));
    if (existing) {
      activeConvoId = existing.id;
    } else {
      activeConvoId = Date.now();
      conversations.push({ id: activeConvoId, participants: [req.user.id, recipientId], lastMessage: text, lastUpdated: new Date() });
    }
  } else {
    const convo = conversations.find(c => c.id === parseInt(activeConvoId));
    if (convo) {
      convo.lastMessage = text;
      convo.lastUpdated = new Date();
    }
  }

  const newMessage = {
    id: Date.now(),
    convoId: activeConvoId,
    senderId: req.user.id,
    text,
    timestamp: new Date()
  };
  messages.push(newMessage);
  res.status(201).json(newMessage);
});

app.get('/api/chat/users', authMiddleware, (req, res) => {
  const chatUsers = users
    .filter(u => u.id !== req.user.id)
    .map(u => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, avatar: u.avatar || u.fullName.charAt(0).toUpperCase() }));
  res.json(chatUsers);
});

app.get('/api/instructors', authMiddleware, (req, res) => {
  const instr = users.filter(u => u.role === 'instructor').map(({ password, ...u }) => u);
  res.json(instr);
});

// ═══════════════════════════════════════════════
// FEEDBACK / QUERIES ROUTES
// ═══════════════════════════════════════════════
app.post('/api/feedback', (req, res) => {
  const { name, email, message, subject } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ message: 'All fields are required' });
  const newQuery = { id: Date.now(), name, email, message, subject: subject || 'General Query', status: 'open', createdAt: new Date() };
  feedback.push(newQuery);
  res.status(201).json({ message: 'Query submitted successfully. Thank you!' });
});

app.get('/api/feedback', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin only' });
  res.json(feedback);
});

app.patch('/api/feedback/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  const query = feedback.find(q => q.id === parseInt(req.params.id));
  if (query) {
    query.status = req.body.status || 'closed';
    return res.json(query);
  }
  res.status(404).json({ message: 'Query not found' });
});

// ═══════════════════════════════════════════════
// SCHEDULE ROUTES (Student only)
// ═══════════════════════════════════════════════
app.get('/api/schedule', authMiddleware, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });

  const studentId = req.user.id;
  const now = new Date();
  const events = [];

  // 1. Upcoming assignment deadlines for enrolled courses
  const enrolledCourseIds = enrollments
    .filter(e => e.userId === studentId)
    .map(e => e.courseId);

  assignments.forEach(a => {
    if (enrolledCourseIds.includes(a.courseId)) {
      const due = new Date(a.dueDate);
      const alreadySubmitted = submissions.some(s => s.assignmentId === a.id && s.studentId === studentId);
      events.push({
        id: `assign-${a.id}`,
        type: 'assignment',
        title: a.title,
        course: courses.find(c => c.id === a.courseId)?.title || 'Unknown Course',
        dueDate: a.dueDate,
        status: alreadySubmitted ? 'submitted' : due < now ? 'overdue' : 'pending',
        maxMarks: a.maxMarks,
        description: a.description,
      });
    }
  });

  // 2. Recent quiz sessions (last 7 days)
  quizzes
    .filter(q => q.studentId === studentId)
    .slice(-5)
    .forEach(q => {
      events.push({
        id: `quiz-${q.id}`,
        type: 'quiz',
        title: `Quiz: ${q.topic}`,
        course: q.topic,
        dueDate: q.createdAt,
        status: 'completed',
        score: `${q.score}/${q.totalQuestions}`,
        description: `Scored ${q.score} out of ${q.totalQuestions} questions.`,
      });
    });

  // 3. Enrolled course sessions (next 7 days simulated from course data)
  enrolledCourseIds.forEach((cId, idx) => {
    const course = courses.find(c => c.id === cId);
    if (course) {
      // Generate a weekly class slot per enrolled course
      const classDate = new Date(now);
      classDate.setDate(now.getDate() + ((idx % 7) + 1));
      classDate.setHours(10 + idx, 0, 0, 0);
      events.push({
        id: `class-${cId}-${idx}`,
        type: 'class',
        title: `${course.title} — Live Session`,
        course: course.title,
        instructor: course.instructor,
        dueDate: classDate.toISOString(),
        status: 'upcoming',
        description: `Weekly live class with ${course.instructor}.`,
      });
    }
  });

  // Sort all events by date
  events.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  res.json(events);
});

// ═══════════════════════════════════════════════
// PROGRESS & STUDENT DATA ROUTES
// ═══════════════════════════════════════════════
app.get('/api/users/students', authMiddleware, (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Forbidden' });
  const studentList = users.filter(u => u.role === 'student').map(({ password, ...u }) => u);
  res.json(studentList);
});

const getProgressData = (studentId) => {
  const studentEnrollments = enrollments.filter(e => e.userId === studentId).map(e => ({
    courseId: e.courseId,
    course: courses.find(c => c.id === e.courseId),
    progressPct: e.progressPct || 0
  }));
  const studentAssignments = assignments.filter(a => a.studentId === studentId);
  const studentQuizzes = quizzes.filter(q => q.studentId === studentId);
  return { courses: studentEnrollments, assignments: studentAssignments, quizzes: studentQuizzes };
};

app.get('/api/progress/my', authMiddleware, (req, res) => {
  res.json(getProgressData(req.user.id));
});

app.get('/api/progress/student/:id', authMiddleware, (req, res) => {
  if (req.user.role === 'student') return res.status(403).json({ message: 'Forbidden' });
  res.json(getProgressData(req.params.id));
});

// ═══════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', users: users.length, courses: courses.length, enrollments: enrollments.length });
});

const PORT = process.env.PORT || 5000;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Shiksharthee Server running on port ${PORT}`);
    console.log(`📚 ${courses.length} courses active | 🔑 JWT ready`);
  });
});
