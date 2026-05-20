import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, CheckCircle, Clock, Award, Plus, X, Upload } from 'lucide-react';
import './StaticPages.css';

const Assignments = () => {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'published'

  // Input states
  const [answerInput, setAnswerInput] = useState({});
  const [fileInput, setFileInput] = useState({});
  const [gradeInput, setGradeInput] = useState({});
  const [gradeSuccess, setGradeSuccess] = useState({});

  // Modal State for New Assignment
  const [showModal, setShowModal] = useState(false);
  const [newAssignData, setNewAssignData] = useState({ title: '', description: '', timeLimit: '7 days', maxMarks: '100' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
    if (loggedInUser) {
      if (loggedInUser.role === 'student') {
        fetchStudentData();
      } else {
        fetchInstructorData();
      }
    }
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      const resAssign = await fetch('http://localhost:5000/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } });
      const assigns = await resAssign.json();
      setAssignments(assigns);

      const resSubs = await fetch('http://localhost:5000/api/assignments/my', { headers: { 'Authorization': `Bearer ${token}` } });
      const subs = await resSubs.json();
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resAssign, resSubs] = await Promise.all([
        fetch('http://localhost:5000/api/assignments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/assignments/submissions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const assigns = await resAssign.json();
      const subs = await resSubs.json();
      setAssignments(assigns);
      setSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (assignmentId) => {
    const answer = answerInput[assignmentId];
    const fileUrl = fileInput[assignmentId];
    if (!answer && !fileUrl) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/assignments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ assignmentId, answer, fileUrl })
      });
      if (res.ok) {
        alert('Assignment submitted successfully!');
        fetchStudentData();
      } else {
        const data = await res.json();
        alert(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    const marks = gradeInput[submissionId];
    if (!marks && marks !== 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/assignments/grade/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ marks })
      });
      if (res.ok) {
        setGradeSuccess(prev => ({ ...prev, [submissionId]: true }));
        setTimeout(() => {
          setGradeSuccess(prev => ({ ...prev, [submissionId]: false }));
          fetchInstructorData();
        }, 1500);
      } else {
        const data = await res.json();
        alert('Error: ' + (data.message || 'Could not save grade'));
      }
    } catch (err) {
      console.error(err);
      alert('Server connection error. Please try again.');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignData.title || !newAssignData.maxMarks) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newAssignData)
      });
      if (res.ok) {
        alert('✅ Assignment published successfully!');
        setShowModal(false);
        setNewAssignData({ title: '', description: '', timeLimit: '7 days', maxMarks: '100' });
        fetchInstructorData();
      } else {
        const data = await res.json();
        alert('❌ Error: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error: Server connection failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><div className="container">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="container" style={{ padding: '2rem' }}>
        {/* Page Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>Assignments</h2>
            <p>{user?.role === 'student' ? 'Complete your assigned tasks.' : 'Create assignments and grade student submissions.'}</p>
          </div>
          {user?.role !== 'student' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Publish Assignment
            </button>
          )}
        </div>

        {user?.role === 'student' ? (
          <div className="assignments-list" style={{ display: 'grid', gap: '1.5rem' }}>
            {assignments.map(assign => {
              const submission = submissions.find(s => s.assignmentId === assign.id);
              return (
                <div key={assign.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} color="var(--primary-color)" /> {assign.title}
                      </h3>
                      <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{assign.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> Time Limit: {assign.timeLimit}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={16} /> Max Marks: {assign.maxMarks}</span>
                      </div>
                    </div>
                    {submission ? (
                      <div style={{ padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: submission.status === 'graded' ? '#dcfce7' : '#fef3c7', color: submission.status === 'graded' ? '#166534' : '#92400e', fontWeight: 500, fontSize: '0.875rem' }}>
                        {submission.status === 'graded' ? `Graded: ${submission.marks}/${assign.maxMarks}` : 'Pending Review'}
                      </div>
                    ) : (
                      <div style={{ padding: '0.5rem 1rem', borderRadius: '999px', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: 500, fontSize: '0.875rem' }}>
                        Not Submitted
                      </div>
                    )}
                  </div>

                  {!submission && (
                    <div style={{ marginTop: '1.5rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Submit Your Work</h4>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Write your answer or notes here..."
                        value={answerInput[assign.id] || ''}
                        onChange={(e) => setAnswerInput({...answerInput, [assign.id]: e.target.value})}
                        style={{ marginBottom: '1rem' }}
                      ></textarea>
                      <input 
                        type="url" 
                        className="form-control" 
                        placeholder="Optional: Link to your file (Google Drive, GitHub, etc.)"
                        value={fileInput[assign.id] || ''}
                        onChange={(e) => setFileInput({...fileInput, [assign.id]: e.target.value})}
                      />
                      <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }} onClick={() => handleStudentSubmit(assign.id)}>
                        <CheckCircle size={18} /> Submit Assignment
                      </button>
                    </div>
                  )}

                  {submission && (
                    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Your Submission</h4>
                      {submission.answer && <p style={{ whiteSpace: 'pre-wrap', color: '#334155', marginBottom: '1rem' }}>{submission.answer}</p>}
                      {submission.fileUrl && (
                        <a href={submission.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
                          <FileText size={16} /> View Attached File
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {assignments.length === 0 && <p>No assignments have been assigned yet.</p>}
          </div>
        ) : (
          <div>
            {/* Instructor Tabs */}
            <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('submissions')} 
                style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: activeTab === 'submissions' ? 'var(--primary-color)' : '#6b7280', borderBottom: activeTab === 'submissions' ? '2px solid var(--primary-color)' : 'none', cursor: 'pointer' }}
              >
                Submissions to Grade ({submissions.length})
              </button>
              <button 
                onClick={() => setActiveTab('published')} 
                style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: activeTab === 'published' ? 'var(--primary-color)' : '#6b7280', borderBottom: activeTab === 'published' ? '2px solid var(--primary-color)' : 'none', cursor: 'pointer' }}
              >
                Published Assignments ({assignments.length})
              </button>
            </div>

            {activeTab === 'submissions' ? (
              <div className="submissions-list" style={{ display: 'grid', gap: '1.5rem' }}>
                {submissions.length === 0 ? <p>No submissions to review yet.</p> : submissions.map(sub => (
                  <div key={sub.id} className="card" style={{ padding: '1.5rem', borderLeft: sub.status === 'graded' ? '4px solid #22c55e' : '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ 
                          width: '45px', 
                          height: '45px', 
                          borderRadius: '50%', 
                          background: 'linear-gradient(135deg, var(--primary-color), #8b5cf6)', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 700, 
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}>
                          {sub.studentAvatar || sub.studentName?.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.15rem', color: '#0f172a' }}>{sub.assignmentTitle}</h3>
                          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
                            Submitted by: <strong style={{ color: '#0f172a' }}>{sub.studentName}</strong> 
                            <span style={{ color: '#6b7280', marginLeft: '0.5rem', fontFamily: 'monospace' }}>({sub.studentEmail})</span>
                          </p>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginTop: '0.1rem' }}>Max Marks: {sub.maxMarks}</p>
                        </div>
                      </div>
                      <div style={{ padding: '0.4rem 0.8rem', borderRadius: '999px', backgroundColor: sub.status === 'graded' ? '#dcfce7' : '#fef3c7', color: sub.status === 'graded' ? '#166534' : '#92400e', fontSize: '0.875rem', fontWeight: 600 }}>
                        {sub.status === 'graded' ? 'Graded' : 'Needs Grading'}
                      </div>
                    </div>
                    
                    <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Student Answer</h4>
                      {sub.answer && <p style={{ whiteSpace: 'pre-wrap', color: '#334155', marginBottom: '1rem' }}>{sub.answer}</p>}
                      {sub.fileUrl && (
                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
                          <FileText size={16} /> Open Attached File
                        </a>
                      )}
                    </div>

                    {gradeSuccess[sub.id] ? (
                      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle size={20} color="#16a34a" />
                        <p style={{ fontWeight: 600, color: '#16a34a', margin: 0 }}>✅ Grade submitted: {gradeInput[sub.id]} / {sub.maxMarks}</p>
                      </div>
                    ) : sub.status === 'pending' ? (
                      <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px dashed #fcd34d' }}>
                        <p style={{ fontWeight: 600, color: '#b45309', marginBottom: '0.75rem', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Grade This Submission</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '200px' }}>
                            <input 
                              type="number" 
                              className="form-control" 
                              placeholder={`Enter marks (0 – ${sub.maxMarks})`} 
                              value={gradeInput[sub.id] || ''}
                              onChange={(e) => setGradeInput({...gradeInput, [sub.id]: e.target.value})}
                              max={sub.maxMarks}
                              min="0"
                              style={{ width: '100%' }}
                            />
                          </div>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => handleGradeSubmit(sub.id)}
                            disabled={!gradeInput[sub.id] && gradeInput[sub.id] !== 0}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <Award size={16} style={{ marginRight: '6px' }} />
                            Submit Grade
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Award size={20} color="#16a34a" />
                        <p style={{ fontWeight: 600, color: '#16a34a', margin: 0 }}>Marks Awarded: {sub.marks} / {sub.maxMarks}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="published-assignments-list" style={{ display: 'grid', gap: '1.5rem' }}>
                {assignments.map(assign => (
                  <div key={assign.id} className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={20} color="var(--primary-color)" /> {assign.title}
                    </h3>
                    <p style={{ color: '#4b5563', marginBottom: '1rem' }}>{assign.description}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> Time Limit: {assign.timeLimit}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Award size={16} /> Max Marks: {assign.maxMarks}</span>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && <p>No assignments published yet. Click "Publish Assignment" to make one!</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PUBLISH ASSIGNMENT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={22} color="var(--primary-color)" /> Publish New Assignment</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateAssignment} style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Assignment Title *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. React Todo Application" 
                  value={newAssignData.title}
                  onChange={e => setNewAssignData({ ...newAssignData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Instructions / Description *</label>
                <textarea 
                  className="form-control" 
                  rows="4" 
                  required 
                  placeholder="Explain what students need to do..." 
                  value={newAssignData.description}
                  onChange={e => setNewAssignData({ ...newAssignData, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Time Limit</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. 7 days" 
                    value={newAssignData.timeLimit}
                    onChange={e => setNewAssignData({ ...newAssignData, timeLimit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Max Marks *</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    required 
                    placeholder="100" 
                    value={newAssignData.maxMarks}
                    onChange={e => setNewAssignData({ ...newAssignData, maxMarks: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {submitting ? 'Publishing...' : <><Upload size={16} /> Publish</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Assignments;
