# 🎓 Shiksharthee E-Learning Platform: Practical Viva & Presentation Guide

Welcome to your ultimate preparation guide for your practical viva and
presentation! The Shiksharthee platform is a modern, feature-rich,
full-stack e-learning application.

------------------------------------------------------------------------

## 🚀 1. The 2-Minute Project Pitch

> **Good morning respected teachers and HOD. Today, I am presenting
> Shiksharthee, a next-generation E-Learning Platform designed to bridge
> the gap between traditional learning and modern interactive
> education.**
>
> **Shiksharthee is built on the MERN stack (MongoDB, Express, React,
> Node.js). It offers a dynamic dashboard for students, interactive
> video-based learning, assignments with submission and grading
> pipelines, personal calendars, a live message box for student-teacher
> interaction, and a robust admin analytics portal.**
>
> **The highlight of Shiksharthee is its AI-Powered Assessment Engine.
> Instead of pre-configured quizzes, we have integrated Google Gemini
> 2.5 Flash to generate customized 10-question MCQ quizzes with detailed
> explanations on any topic entered by the student in real time.**

------------------------------------------------------------------------

## 🛠️ 2. Technology Stack

  Layer               Technology                Purpose
  ------------------- ------------------------- --------------------------
  Frontend            React.js v19              Fast component-based UI
  Routing             React Router DOM v7       Client-side routing
  Styling             Vanilla CSS               Custom responsive design
  Icons               Lucide React              Modern SVG icons
  Backend             Node.js + Express.js      REST API server
  Database            MongoDB Atlas             Cloud NoSQL database
  ORM                 Mongoose                  Schema & validation
  Authentication      JWT                       Secure authentication
  Password Security   bcrypt.js                 Password hashing
  AI                  Google Gemini 2.5 Flash   Dynamic quiz generation

------------------------------------------------------------------------

## 💾 3. Database Architecture

### Hybrid Cache Architecture

-   Active data is maintained in server memory.
-   Every successful POST, PUT, PATCH or DELETE request triggers
    `saveToDatabase()`.
-   Entire application state is synchronized into the **AppState**
    collection.

### Visual Collections

-   Users
-   Courses
-   Feedbacks

**Advantages** - Faster response time. - Reduced database load. -
Automatic cloud backup. - Better scalability.

------------------------------------------------------------------------

## 🔑 4. Authentication Flow

1.  Register user.
2.  Hash password using bcrypt.
3.  Verify credentials during login.
4.  Generate JWT valid for 24 hours.
5.  Store token in localStorage.
6.  Verify token using auth middleware.

------------------------------------------------------------------------

## 🧠 5. AI Quiz Generation

1.  Student enters topic.
2.  Frontend calls `/api/quizzes/generate`.
3.  Backend checks Gemini API key.
4.  Sends prompt requesting exactly 10 MCQs.
5.  Gemini returns JSON.
6.  Backend parses JSON.
7.  Questions are displayed.
8.  If Gemini fails, fallback questions are used.

------------------------------------------------------------------------

## 🎥 6. Learning Module

-   Student enrolls in a course.
-   Lessons are played using embedded YouTube videos.
-   Progress is updated through `/api/progress`.
-   Dashboard shows progress bars and charts.

------------------------------------------------------------------------

## 👩‍🏫 7. Viva Questions

### Why MongoDB?

MongoDB stores JSON-like documents, making nested course structures
easier than relational tables and joins.

### Why JWT?

JWT provides stateless authentication and secures protected routes.

### Why bcrypt?

Passwords are stored as irreversible hashes with salting for security.

### What is CORS?

CORS allows the React frontend and Express backend running on different
ports to communicate securely.

### What happens if Gemini fails?

The backend automatically loads predefined quiz questions so the
application continues working.

------------------------------------------------------------------------

## 📈 8. Demo Flow

1.  Login as Student.
2.  Show Dashboard.
3.  Enroll in a course.
4.  Complete lessons.
5.  Generate AI quiz.
6.  Submit quiz.
7.  Send a message.
8.  Login as Admin.
9.  Show analytics dashboard.
10. Demonstrate course management.

------------------------------------------------------------------------

## ✅ Conclusion

Shiksharthee is a complete MERN-based e-learning platform that combines
secure authentication, cloud database management, AI-powered
assessments, progress tracking, messaging, and analytics into one
scalable educational system.
