import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Megaphone, Plus, FileText, Trash2, ExternalLink, Clock, User } from 'lucide-react';
import './StaticPages.css';

const Announcements = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // New Announcement Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [type, setType] = useState('info');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message, fileUrl, type })
      });
      if (res.ok) {
        setTitle('');
        setMessage('');
        setFileUrl('');
        setType('info');
        setShowForm(false);
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Megaphone size={28} color="var(--primary-color)" /> Announcements
            </h2>
            <p style={{ color: '#64748b' }}>Stay updated with the latest news and resources.</p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : <><Plus size={18} /> New Announcement</>}
            </button>
          )}
        </div>

        {showForm && user?.role === 'admin' && (
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Announcement</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Announcement Title" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea className="form-control" rows="4" value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Write your announcement here..."></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Attachment URL (PDF, Image, etc.)</label>
                  <input type="url" className="form-control" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="info">Information (Blue)</option>
                    <option value="warning">Important (Yellow)</option>
                    <option value="error">Urgent (Red)</option>
                    <option value="success">Update (Green)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Post Announcement</button>
            </form>
          </div>
        )}

        <div className="announcements-list" style={{ display: 'grid', gap: '1.5rem' }}>
          {loading ? <p>Loading announcements...</p> : announcements.length === 0 ? <p>No announcements yet.</p> : announcements.map(ann => (
            <div key={ann.id} className="card" style={{ 
              padding: '1.5rem', 
              borderLeft: `5px solid ${ann.type === 'warning' ? '#f59e0b' : ann.type === 'error' ? '#ef4444' : ann.type === 'success' ? '#10b981' : '#3b82f6'}`,
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0f172a' }}>{ann.title}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(ann.date).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><User size={14} /> {ann.author}</span>
                  </div>
                </div>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '999px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  background: ann.type === 'warning' ? '#fef3c7' : ann.type === 'error' ? '#fef2f2' : ann.type === 'success' ? '#f0fdf4' : '#eff6ff',
                  color: ann.type === 'warning' ? '#92400e' : ann.type === 'error' ? '#991b1b' : ann.type === 'success' ? '#166534' : '#1e40af'
                }}>
                  {ann.type}
                </span>
              </div>
              <p style={{ color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>{ann.message}</p>
              
              {ann.fileUrl && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  <a href={ann.fileUrl} target="_blank" rel="noreferrer" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: 'var(--primary-color)', 
                    fontWeight: 500, 
                    fontSize: '0.875rem',
                    textDecoration: 'none'
                  }}>
                    <FileText size={18} /> View Attachment <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Announcements;
