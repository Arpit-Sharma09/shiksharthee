import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, createCourse, deleteCourse, fetchCourses } from '../services/api';
import {
  Plus, Upload, Film, BookOpen, Users, DollarSign, Star,
  Edit2, Trash2, Eye, BarChart2, CheckCircle, AlertCircle,
  X, TrendingUp, RefreshCw, Shield
} from 'lucide-react';
import './AdminDashboard.css';

// ── Animated number component ──────────────────
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(String(value).replace(/[^0-9]/g, '')) || 0;
    if (end === 0) { setDisplay(0); return; }
    const step = Math.ceil(end / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start);
      if (start >= end) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString('en-IN')}{suffix}</>;
};

// ── Bar Chart ──────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.revenue || 1), 1);
  return (
    <div className="bar-chart-container">
      {data.map((d, i) => (
        <div className="bar-col" key={i}>
          <span className="bar-value">₹{d.revenue}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ height: `${(d.revenue / max) * 100}%`, animationDelay: `${i * 0.1}s` }} />
          </div>
          <span className="bar-month">{d.month}</span>
          <span className="bar-enr">{d.enrollments} enr.</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '', description: '', price: '', instructor: '',
    category: 'Web Development', level: 'Beginner',
    duration: '', language: 'Hindi', videoUrl: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c] = await Promise.all([getAdminStats(), fetchCourses()]);
      setStats(s);
      setCourses(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadData(); }, [isAdmin, loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAdmin) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin, loadData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: '', message: '' });
    try {
      await createCourse(courseData);
      setFormStatus({ type: 'success', message: '✅ Course published successfully!' });
      setCourseData({ title: '', description: '', price: '', instructor: '', category: 'Web Development', level: 'Beginner', duration: '', language: 'Hindi', videoUrl: '' });
      loadData();
      setTimeout(() => { setShowModal(false); setFormStatus({ type: '', message: '' }); }, 1800);
    } catch (err) {
      setFormStatus({ type: 'error', message: '❌ ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (courseId) => {
    try {
      await deleteCourse(courseId);
      loadData();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="access-denied-container">
          <div className="access-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>You must be logged in as an <strong>Admin</strong> to access this panel.</p>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Register a new account with role "Admin" to get access.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: <BookOpen size={22} />, color: '#6366f1', bg: '#ede9fe' },
    { label: 'Registered Students', value: stats?.totalStudents ?? 0, icon: <Users size={22} />, color: '#10b981', bg: '#d1fae5' },
    { label: 'Total Enrollments', value: stats?.totalEnrollments ?? 0, icon: <TrendingUp size={22} />, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, icon: <DollarSign size={22} />, color: '#ef4444', bg: '#fee2e2', raw: stats?.totalRevenue ?? 0 },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="admin-header-bar">
        <div>
          <h2><Shield size={22} style={{ display: 'inline', marginRight: '8px', color: '#6366f1' }} />Admin Control Panel</h2>
          <p>Real-time platform management — data updates every 30 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={loadData} disabled={loading}>
            <RefreshCw size={16} style={{ marginRight: '6px' }} />{loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-primary add-course-btn" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Add New Course
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['overview', 'courses', 'students', 'analytics'].map(tab => (
          <button key={tab} className={`admin-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────── */}
      {activeTab === 'overview' && (
        <div>
          <div className="admin-stats-grid">
            {statCards.map((s, i) => (
              <div className="admin-stat-card" key={i}>
                <div className="stat-icon-wrap" style={{ backgroundColor: s.bg }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <p className="stat-label">{s.label}</p>
                  <h3 className="stat-value" style={{ color: s.color }}>
                    {loading ? '...' : (s.raw !== undefined
                      ? <AnimatedNumber value={s.raw} prefix="₹" />
                      : <AnimatedNumber value={s.value} />)}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-two-col">
            {/* Recent Enrollments */}
            <div className="card">
              <div className="card-header"><h3>Recent Enrollments</h3></div>
              {loading ? <p className="loading-text">Loading...</p> : (
                <table className="admin-table">
                  <thead><tr><th>Student</th><th>Course</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {(stats?.recentEnrollments || []).map((e, i) => (
                      <tr key={i}>
                        <td><strong>{e.user?.fullName || 'Unknown'}</strong><br /><small style={{ color: '#9ca3af' }}>{e.user?.email}</small></td>
                        <td>{e.course?.title}</td>
                        <td>₹{e.amountPaid}</td>
                        <td>{new Date(e.enrolledAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                    {(!stats?.recentEnrollments?.length) && (
                      <tr><td colSpan={4} className="empty-table">No enrollments yet.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header"><h3>Quick Actions</h3></div>
              <div className="quick-actions">
                <button className="quick-action-btn" onClick={() => setShowModal(true)}>
                  <div className="qa-icon blue"><Plus size={20} /></div><span>Add Course</span>
                </button>
                <button className="quick-action-btn" onClick={() => setActiveTab('courses')}>
                  <div className="qa-icon green"><BookOpen size={20} /></div><span>All Courses</span>
                </button>
                <button className="quick-action-btn" onClick={() => setActiveTab('students')}>
                  <div className="qa-icon orange"><Users size={20} /></div><span>Students</span>
                </button>
                <button className="quick-action-btn" onClick={() => setActiveTab('analytics')}>
                  <div className="qa-icon purple"><BarChart2 size={20} /></div><span>Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSES TAB ──────────────────── */}
      {activeTab === 'courses' && (
        <div className="card">
          <div className="card-header space-between">
            <h3>All Courses ({courses.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}><Plus size={16} /> Add Course</button>
          </div>
          {loading ? <p className="loading-text">Loading courses...</p> : (
            <table className="admin-table full-table">
              <thead>
                <tr><th>#</th><th>Title</th><th>Category</th><th>Level</th><th>Instructor</th><th>Price</th><th>Enrolled</th><th>Video</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td><strong>{c.title}</strong></td>
                    <td><span className="tag">{c.category || 'General'}</span></td>
                    <td><span className="tag" style={{ background: '#dbeafe', color: '#1d4ed8' }}>{c.level || 'Beginner'}</span></td>
                    <td>{c.instructor}</td>
                    <td><strong>₹{c.price}</strong></td>
                    <td><span className="tag" style={{ background: '#d1fae5', color: '#065f46' }}>{c.enrolled || 0} students</span></td>
                    <td>
                      {c.videoUrl
                        ? <a href={c.videoUrl} target="_blank" rel="noreferrer" className="video-link"><Film size={14} /> Preview</a>
                        : <span className="no-video">No video</span>}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-action-btn blue" title="View Details" onClick={() => alert(`Course: ${c.title}\n\nDescription: ${c.description}\nDuration: ${c.duration}\nLanguage: ${c.language}`)}>
                          <Eye size={15} />
                        </button>
                        <button className="icon-action-btn red" title="Delete Course" onClick={() => setDeleteConfirm(c)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && <tr><td colSpan={9} className="empty-table">No courses yet. Add one!</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── STUDENTS TAB ─────────────────── */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="card-header space-between">
            <h3>All Registered Users ({stats?.allUsers?.length || 0})</h3>
            <span className="tag">Live Data</span>
          </div>
          {loading ? <p className="loading-text">Loading...</p> : (
            <table className="admin-table full-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(stats?.allUsers || []).map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.fullName}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`tag ${u.role === 'admin' ? 'red-tag' : u.role === 'instructor' ? 'orange-tag' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                ))}
                {(!stats?.allUsers?.length) && <tr><td colSpan={6} className="empty-table">No registered users yet.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── ANALYTICS TAB ────────────────── */}
      {activeTab === 'analytics' && (
        <div>
          <div className="admin-stats-grid">
            {[
              { label: 'Total Enrollments', value: stats?.totalEnrollments ?? 0, icon: <Users size={22} />, color: '#6366f1', bg: '#ede9fe' },
              { label: 'Monthly Revenue', value: stats?.monthlyRevenue?.slice(-1)[0]?.revenue ?? 0, icon: <DollarSign size={22} />, color: '#10b981', bg: '#d1fae5', prefix: '₹' },
              { label: 'Active Students', value: stats?.totalStudents ?? 0, icon: <CheckCircle size={22} />, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Total Courses', value: stats?.totalCourses ?? 0, icon: <BookOpen size={22} />, color: '#ef4444', bg: '#fee2e2' },
            ].map((s, i) => (
              <div className="admin-stat-card" key={i}>
                <div className="stat-icon-wrap" style={{ backgroundColor: s.bg }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                </div>
                <div>
                  <p className="stat-label">{s.label}</p>
                  <h3 className="stat-value" style={{ color: s.color }}>
                    {loading ? '...' : <AnimatedNumber value={s.value} prefix={s.prefix || ''} />}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="card analytics-card">
            <div className="card-header space-between">
              <h3>Revenue & Enrollment — Last 6 Months</h3>
              <span className="tag">Live Data</span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {loading ? <p className="loading-text">Loading chart...</p> : (
                stats?.monthlyRevenue?.length
                  ? <BarChart data={stats.monthlyRevenue} />
                  : <div className="empty-table">No revenue data yet. Students need to enroll in courses!</div>
              )}
            </div>
          </div>

          {/* Course Popularity Table */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="card-header"><h3>Course Popularity</h3></div>
            <table className="admin-table full-table">
              <thead><tr><th>Course</th><th>Instructor</th><th>Price</th><th>Enrolled</th><th>Revenue</th></tr></thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.title}</strong></td>
                    <td>{c.instructor}</td>
                    <td>₹{c.price}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, background: '#f3f4f6', borderRadius: '999px', height: '6px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ width: `${Math.min(((c.enrolled || 0) / (Math.max(...courses.map(x => x.enrolled || 0), 1))) * 100, 100)}%`, height: '100%', background: '#6366f1', borderRadius: '999px' }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.enrolled || 0}</span>
                      </div>
                    </td>
                    <td><strong>₹{((c.enrolled || 0) * c.price).toLocaleString('en-IN')}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADD COURSE MODAL ─────────────── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Film size={20} /> Publish New Course</h3>
              <button className="modal-close-btn" onClick={() => { setShowModal(false); setFormStatus({ type: '', message: '' }); }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {formStatus.message && <div className={`status-msg ${formStatus.type}`}>{formStatus.message}</div>}
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label>Course Title *</label>
                  <input name="title" value={courseData.title} onChange={e => setCourseData({ ...courseData, title: e.target.value })} required placeholder="e.g. Advanced React Patterns" />
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Category *</label>
                    <select name="category" value={courseData.category} onChange={e => setCourseData({ ...courseData, category: e.target.value })}>
                      {['Web Development','Database','UI/UX Design','JavaScript','React','Node.js','Python','Data Science','DSA'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Level *</label>
                    <select name="level" value={courseData.level} onChange={e => setCourseData({ ...courseData, level: e.target.value })}>
                      {['Beginner','Intermediate','Advanced'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select name="language" value={courseData.language} onChange={e => setCourseData({ ...courseData, language: e.target.value })}>
                      {['Hindi','English','Hinglish'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input name="price" type="number" value={courseData.price} onChange={e => setCourseData({ ...courseData, price: e.target.value })} required placeholder="499" />
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input name="duration" value={courseData.duration} onChange={e => setCourseData({ ...courseData, duration: e.target.value })} placeholder="e.g. 20 hours, 60 lectures" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Instructor Name *</label>
                  <input name="instructor" value={courseData.instructor} onChange={e => setCourseData({ ...courseData, instructor: e.target.value })} required placeholder="e.g. Dr. Kapoor" />
                </div>
                <div className="form-group">
                  <label>Course Description *</label>
                  <textarea name="description" value={courseData.description} onChange={e => setCourseData({ ...courseData, description: e.target.value })} rows="3" required placeholder="What will students learn?" />
                </div>
                <div className="form-group">
                  <label><Film size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />Intro Video URL</label>
                  <input name="videoUrl" value={courseData.videoUrl} onChange={e => setCourseData({ ...courseData, videoUrl: e.target.value })} placeholder="https://youtube.com/... or direct video link" />
                  <small className="help-text">Paste a YouTube or mp4 link for the course preview video.</small>
                </div>
                <div className="modal-form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Publishing...' : <><Upload size={16} /> Publish Course</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ─────────── */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-container" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Delete Course</h3>
              <button className="modal-close-btn" onClick={() => setDeleteConfirm(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
                Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This will also remove all enrollments for this course.
              </p>
              <div className="modal-form-actions">
                <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => handleDelete(deleteConfirm.id)}>
                  <Trash2 size={16} /> Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
