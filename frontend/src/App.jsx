import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import QuizzesAttempt from './pages/QuizzesAttempt';
import Learning from './pages/Learning';
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import About from './pages/About';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';

import Assignments from './pages/Assignments';
import Quizzes from './pages/Quizzes';
import Progress from './pages/Progress';
import Announcements from './pages/Announcements';
import Queries from './pages/Queries';
import MySchedule from './pages/MySchedule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/learning/:courseId" element={<Learning />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/inbox" element={<Messages />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="/my-schedule" element={<MySchedule />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
