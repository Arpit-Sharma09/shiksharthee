import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Navbar from '../components/Navbar';
import { Search, Code, Database, FileJson, Layout, Monitor, Sparkles, Play, BookOpen, Star, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { enrollInCourse, getMyEnrollments } from '../services/api';
import './Courses.css';
import './StaticPages.css';

const gradients = [
  { bg: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { bg: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
  { bg: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { bg: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { bg: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { bg: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
];

const Icons = [Code, Database, FileJson, Layout, Sparkles, Monitor];

const CourseGrid = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
    if (isLoggedIn) loadEnrollments();
  }, [isLoggedIn]);

  const loadCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses');
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };

  const loadEnrollments = async () => {
    try {
      const enr = await getMyEnrollments();
      setEnrolledIds(enr.map(e => e.courseId));
    } catch { }
  };

  const handleEnroll = async (courseId) => {
    if (!isLoggedIn) { navigate('/register'); return; }
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      setEnrolledIds(prev => [...prev, courseId]);
      navigate(`/learning/${courseId}`);
    } catch (err) {
      if (err.message.includes('Already enrolled')) navigate(`/learning/${courseId}`);
      else alert(err.message);
    } finally { setEnrollingId(null); }
  };

  const categories = ['All', ...new Set(courses.map(c => c.category).filter(Boolean))];
  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  return (
    <>
      <div className="courses-header">
        <div className="courses-title">
          <h2>All Courses</h2>
          <p>Browse {courses.length} courses and start your learning journey.</p>
        </div>
        <div className="courses-filters">
          <div className="search-bar">
            <Search size={16} color="#9ca3af" />
            <input type="text" placeholder="Search courses or instructors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="category-select" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>Loading courses...</div>
      ) : (
        <div className="courses-grid">
          {filtered.map((course, i) => {
            const Icon = Icons[i % Icons.length];
            const grad = gradients[i % gradients.length];
            const isEnrolled = enrolledIds.includes(course.id);
            const canView = isEnrolled || isAdmin;

            return (
              <div className="course-card" key={course.id}>
                <div className="course-banner" style={{ background: grad.gradient }}>
                  <Icon size={36} color="#fff" className="banner-icon" />
                  {isEnrolled && (
                    <div className="enrolled-chip"><span>✓ Enrolled</span></div>
                  )}
                  {isAdmin && (
                    <div className="enrolled-chip admin-chip"><span>Admin Access</span></div>
                  )}
                </div>
                <div className="course-card-content">
                  <div className="course-meta-chips">
                    <span className="course-chip">{course.category || 'General'}</span>
                    <span className="course-chip level">{course.level || 'Beginner'}</span>
                  </div>
                  <h3>{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  <p className="course-instructor">
                    <strong>{course.instructor}</strong>
                  </p>
                  <div className="course-stats-row">
                    <span><Clock size={13} /> {course.duration || 'Self-paced'}</span>
                    <span><Users size={13} /> {course.enrolled || 0} students</span>
                    <span><Star size={13} fill="#f59e0b" color="#f59e0b" /> 4.7</span>
                  </div>
                  <div className="course-card-footer">
                    <span className="course-price">₹{course.price}</span>
                    <button
                      className={`btn ${canView ? 'btn-outline' : 'btn-primary'} btn-sm`}
                      onClick={() => canView ? navigate(`/learning/${course.id}`) : handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? 'Enrolling...' :
                        canView ? <><Play size={13} /> {isAdmin ? 'View Content' : 'Continue'}</> :
                          isLoggedIn ? 'Enroll Now' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              No courses found for "{searchTerm || category}".
            </div>
          )}
        </div>
      )}
    </>
  );
};

const Courses = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => { setIsLoggedIn(!!localStorage.getItem('token')); }, []);

  if (isLoggedIn) {
    return <DashboardLayout><CourseGrid isLoggedIn={true} /></DashboardLayout>;
  }

  return (
    <div className="static-page">
      <Navbar />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <CourseGrid isLoggedIn={false} />
      </div>
    </div>
  );
};

export default Courses;
