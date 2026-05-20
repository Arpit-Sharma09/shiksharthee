import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Settings as SettingsIcon, Bell, User, Shield } from 'lucide-react';
import './StaticPages.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // For Admin/Instructor notification creation
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('info');

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
  }, []);

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifMessage) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: notifTitle, message: notifMessage, type: notifType })
      });
      if (res.ok) {
        alert('Notification created successfully!');
        setNotifTitle('');
        setNotifMessage('');
        // This will instantly update for anyone polling, or they see it on refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      <div className="container" style={{ padding: '2rem', animation: 'fadeIn 0.5s' }}>
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <h2><SettingsIcon size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Settings & Preferences</h2>
          <p>Customize your Shiksharthee experience.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>


          {/* Profile Basic Info */}
          <div className="card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <User size={20} /> Account Details
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#64748b' }}>Full Name</strong>
              <span>{user?.fullName}</span>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#64748b' }}>Email Address</strong>
              <span>{user?.email}</span>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: '#64748b' }}>Role</strong>
              <span style={{ textTransform: 'capitalize', background: '#e0e7ff', color: '#4f46e5', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>{user?.role}</span>
            </div>
          </div>

          {/* Notifications Pref */}
          <div className="card" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <Bell size={20} /> Notification Preferences
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Enable Alerts</strong>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Receive platform updates and alerts</span>
              </div>
              <button 
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                style={{
                  width: '60px', height: '32px', borderRadius: '999px',
                  backgroundColor: notificationsEnabled ? '#10b981' : '#cbd5e1',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background-color 0.3s'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: 'white', position: 'absolute', top: '4px',
                  left: notificationsEnabled ? '32px' : '4px', transition: 'left 0.3s'
                }}></div>
              </button>
            </div>
          </div>

          {/* Admin/Instructor Notification Creator */}
          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <div className="card" style={{ padding: '2rem', borderRadius: '16px', gridColumn: '1 / -1', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Shield size={20} color="#4f46e5" /> Create Global Notification
              </h3>
              <form onSubmit={handleCreateNotification} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Title</label>
                  <input type="text" className="form-control" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required placeholder="e.g. Server Maintenance" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
                  <textarea className="form-control" rows="3" value={notifMessage} onChange={e => setNotifMessage(e.target.value)} required placeholder="Details about the notification..."></textarea>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Type</label>
                  <select className="form-control" value={notifType} onChange={e => setNotifType(e.target.value)}>
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="error">Error (Red)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Push Notification</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
