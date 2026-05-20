import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getMyEnrollments, getMyProgress, fetchCourses, enrollInCourse } from '../services/api';
import { BookOpen, Clock, Award, TrendingUp, Play, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const ProgressBar = ({ pct, color = '#6366f1' }) => (
  <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px', transition: 'width 0.6s ease' }} />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enr, prog, courses] = await Promise.all([
        getMyEnrollments(),
        getMyProgress(),
        fetchCourses()
      ]);
      setEnrollments(enr);
      setProgress(prog);
      setAllCourses(courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalEnrolled = enrollments.length;
  const completed = enrollments.filter(e => e.progressPct === 100).length;
  const inProgress = enrollments.filter(e => e.progressPct > 0 && e.progressPct < 100).length;
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + (e.progressPct || 0), 0) / enrollments.length)
    : 0;

  const unenrolledCourses = allCourses.filter(c => !enrollments.find(e => e.courseId === c.id));

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋</h2>
          <p>Here's your learning overview for today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/courses')}>Browse Courses</button>
          <button className="btn btn-primary" onClick={() => navigate('/learning/1')}>Continue Learning</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon"><BookOpen size={22} /></div>
          <div className="stat-info">
            <p>Enrolled Courses</p>
            <h3>{totalEnrolled}</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><Award size={22} /></div>
          <div className="stat-info">
            <p>Completed</p>
            <h3>{completed}</h3>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon"><TrendingUp size={22} /></div>
          <div className="stat-info">
            <p>In Progress</p>
            <h3>{inProgress}</h3>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><Clock size={22} /></div>
          <div className="stat-info">
            <p>Avg. Progress</p>
            <h3>{avgProgress}%</h3>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main-grid">
        {/* My Courses with Progress */}
        <div className="dashboard-card-large">
          <div className="card-header-row">
            <h3>My Courses</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/courses')}>View All</button>
          </div>
          {loading ? (
            <div className="loading-placeholder">Loading your courses...</div>
          ) : enrollments.length === 0 ? (
            <div className="empty-state">
              <p>🎓 You haven't enrolled in any course yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/courses')} style={{ marginTop: '1rem' }}>Browse Courses</button>
            </div>
          ) : (
            <div className="course-progress-list">
              {enrollments.map((enr, i) => (
                <div className="course-progress-item" key={enr.id}>
                  <div className="cpi-left">
                    <div className="cpi-icon" style={{ backgroundColor: colors[i % colors.length] + '20', color: colors[i % colors.length] }}>
                      <BookOpen size={18} />
                    </div>
                    <div className="cpi-info">
                      <h4>{enr.course?.title}</h4>
                      <p>{enr.lessonsCompleted || 0}/{enr.course?.totalLessons || 0} lessons · {enr.course?.instructor}</p>
                      <div style={{ marginTop: '0.5rem' }}>
                        <ProgressBar pct={enr.progressPct || 0} color={colors[i % colors.length]} />
                      </div>
                    </div>
                  </div>
                  <div className="cpi-right">
                    <span className="pct-badge" style={{ color: colors[i % colors.length] }}>{enr.progressPct || 0}%</span>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/learning/${enr.courseId}`)}>
                      <Play size={14} /> Resume
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Analytics Chart */}
        <div className="dashboard-card-small">
          <div className="card-header-row">
            <h3>Progress Chart</h3>
          </div>
          <div className="progress-chart">
            {loading ? <div className="loading-placeholder">Loading...</div> : (
              enrollments.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Enroll in courses to see your chart</p>
                </div>
              ) : (
                <div className="bar-chart-wrap">
                  {enrollments.map((enr, i) => (
                    <div className="chart-bar-item" key={enr.id}>
                      <div className="chart-bar-track">
                        <div className="chart-bar-fill" style={{ height: `${enr.progressPct || 0}%`, background: colors[i % colors.length] }} />
                      </div>
                      <span className="chart-bar-label">{enr.course?.title?.split(' ')[0]}</span>
                      <span className="chart-bar-pct">{enr.progressPct || 0}%</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Suggested Courses */}
      {unenrolledCourses.length > 0 && (
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3>Suggested Courses</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/courses')}>See All</button>
          </div>
          <div className="suggested-grid">
            {unenrolledCourses.slice(0, 3).map((c, i) => (
              <div className="suggested-card" key={c.id}>
                <div className="suggested-banner" style={{ background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i + 2) % colors.length]})` }}>
                  <BookOpen size={28} color="white" />
                </div>
                <div className="suggested-info">
                  <h4>{c.title}</h4>
                  <p>{c.instructor} · {c.level}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#6366f1', fontSize: '1.1rem' }}>₹{c.price}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => handleEnroll(c.id)}>Enroll Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
