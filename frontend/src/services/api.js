const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ 'Content-Type': 'application/json', 'x-auth-token': getToken() });

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// ── AUTH ──────────────────────────────────────
export const registerUser = (userData) =>
  fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(handleResponse);

export const loginUser = (credentials) =>
  fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }).then(handleResponse);

export const getMe = () =>
  fetch(`${API_URL}/auth/me`, { headers: authHeader() }).then(handleResponse);

// ── COURSES ───────────────────────────────────
export const fetchCourses = () =>
  fetch(`${API_URL}/courses`).then(handleResponse);

export const createCourse = (courseData) =>
  fetch(`${API_URL}/courses`, { method: 'POST', headers: authHeader(), body: JSON.stringify(courseData) }).then(handleResponse);

export const deleteCourse = (courseId) =>
  fetch(`${API_URL}/courses/${courseId}`, { method: 'DELETE', headers: authHeader() }).then(handleResponse);

// ── ENROLLMENTS ───────────────────────────────
export const enrollInCourse = (courseId) =>
  fetch(`${API_URL}/enrollments`, { method: 'POST', headers: authHeader(), body: JSON.stringify({ courseId }) }).then(handleResponse);

export const getMyEnrollments = () =>
  fetch(`${API_URL}/enrollments/my`, { headers: authHeader() }).then(handleResponse);

export const checkEnrollment = (courseId) =>
  fetch(`${API_URL}/enrollments/check/${courseId}`, { headers: authHeader() }).then(handleResponse);

// ── PROGRESS ──────────────────────────────────
export const updateProgress = (courseId, lessonsCompleted) =>
  fetch(`${API_URL}/progress`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ courseId, lessonsCompleted }) }).then(handleResponse);

export const getMyProgress = () =>
  fetch(`${API_URL}/progress/my`, { headers: authHeader() }).then(handleResponse);

// ── ADMIN ─────────────────────────────────────
export const getAdminStats = () =>
  fetch(`${API_URL}/admin/stats`, { headers: authHeader() }).then(handleResponse);

// ── FEEDBACK ──────────────────────────────────
export const submitFeedback = (feedbackData) =>
  fetch(`${API_URL}/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(feedbackData) }).then(handleResponse);
