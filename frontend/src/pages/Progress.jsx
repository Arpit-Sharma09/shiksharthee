import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, BookOpen, FileText, HelpCircle, Award } from 'lucide-react';
import './StaticPages.css';

const Progress = () => {
  const [user, setUser] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For instructors/admins
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
    if (loggedInUser) {
      if (loggedInUser.role === 'student') {
        fetchMyProgress();
      } else {
        fetchStudents();
      }
    }
  }, []);

  const fetchMyProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/progress/my', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProgressData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users/students', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId) => {
    if (!studentId) {
      setProgressData(null);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/progress/student/${studentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setProgressData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    setSelectedStudentId(id);
    fetchStudentProgress(id);
  };

  const renderProgress = () => {
    if (!progressData) return null;

    const { courses, assignments, quizzes } = progressData;

    // Calculations
    const avgCourseProgress = courses.length ? courses.reduce((acc, c) => acc + c.progressPct, 0) / courses.length : 0;
    const gradedAssignments = assignments.filter(a => a.status === 'graded');
    const avgAssignmentMarks = gradedAssignments.length ? gradedAssignments.reduce((acc, a) => acc + (a.marks / a.maxMarks * 100), 0) / gradedAssignments.length : 0;
    const avgQuizScore = quizzes.length ? quizzes.reduce((acc, q) => acc + (q.score / q.totalQuestions * 100), 0) / quizzes.length : 0;

    const overallProgress = Math.round((avgCourseProgress + avgAssignmentMarks + avgQuizScore) / (courses.length || assignments.length || quizzes.length ? 3 : 1));

    return (
      <div className="progress-dashboard" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)' }}>
            <TrendingUp size={48} color="white" style={{ margin: '0 auto 1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 500, opacity: 0.9 }}>Overall Performance</h3>
            <div style={{ fontSize: '4rem', fontWeight: 800, margin: '0.5rem 0', letterSpacing: '-0.025em' }}>{overallProgress}%</div>
            <p style={{ opacity: 0.8, fontSize: '0.875rem' }}>{overallProgress >= 80 ? 'Excellent work! Keep it up!' : overallProgress >= 50 ? 'Good progress, you can do better!' : 'Needs improvement, start studying!'}</p>
          </div>

          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '16px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}><BookOpen size={28} /></div>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: '#64748b', fontWeight: 500 }}>Avg. Course Completion</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{Math.round(avgCourseProgress)}%</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '12px', color: '#10b981' }}><Award size={28} /></div>
              <div>
                <h3 style={{ fontSize: '1.125rem', color: '#64748b', fontWeight: 500 }}>Avg. Quiz Score</h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{Math.round(avgQuizScore)}%</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Courses */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Enrolled Courses</h3>
              </div>
              <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 500 }}>{courses.length} Active</span>
            </div>
            {courses.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No courses enrolled yet.</p> : courses.map(c => (
              <div key={c.courseId} style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#334155' }}>{c.course?.title}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{c.progressPct}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${c.progressPct}%`, background: 'var(--primary-color)', borderRadius: '999px', transition: 'width 1s ease-in-out' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Assignments */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} color="#f59e0b" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Assignment History</h3>
              </div>
            </div>
            {assignments.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No assignments submitted.</p> : assignments.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>Assignment #{a.assignmentId}</span>
                {a.status === 'graded' ? (
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{a.marks} / {a.maxMarks}</span>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#b45309', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: 500 }}>Pending</span>
                )}
              </div>
            ))}
          </div>

          {/* Quizzes */}
          <div className="card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <HelpCircle size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Quiz Results</h3>
              </div>
            </div>
            {quizzes.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No quizzes attempted.</p> : quizzes.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{q.topic} Quiz</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10b981', background: '#dcfce7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>{Math.round((q.score / q.totalQuestions) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h2>Progress Tracking</h2>
          <p>Real-time analytics of your learning journey.</p>
        </div>

        {user?.role !== 'student' && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Select a Student</h3>
            <select className="form-control" value={selectedStudentId} onChange={handleStudentSelect} style={{ maxWidth: '400px' }}>
              <option value="">-- Choose a student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div>Loading progress data...</div>
        ) : (
          user?.role === 'student' || selectedStudentId ? renderProgress() : <p style={{ color: '#6b7280' }}>Please select a student to view their progress.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Progress;
