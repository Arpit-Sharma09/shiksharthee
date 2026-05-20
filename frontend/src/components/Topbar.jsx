import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, LogOut, ChevronDown, LayoutDashboard, Shield, Settings, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';
import './Navbar.css';

const Topbar = ({ toggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/notifications', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertCircle size={16} color="#f59e0b" />;
      case 'error': return <AlertCircle size={16} color="#ef4444" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  return (
    <header className="topbar" style={{ padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button className="hamburger" onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <Menu size={24} />
        </button>
        <div className="topbar-search" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Search courses..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '250px' }} />
        </div>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="user-nav-section" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="notif-wrap" style={{ position: 'relative' }} onMouseLeave={() => setNotifOpen(false)}>
            <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', position: 'relative' }}>
              <Bell size={20} />
              {notifications.length > 0 && <span className="notif-dot" style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>}
            </button>
            {notifOpen && (
              <div className="user-dropdown" style={{ position: 'absolute', right: '-50px', top: '40px', width: '320px', padding: '0', overflow: 'hidden', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 200 }}>
                <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Notifications</h4>
                  <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.125rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{notifications.length} New</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>No notifications yet.</div>
                  ) : notifications.map(n => (
                    <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '0.125rem' }}>{getNotifIcon(n.type)}</div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{n.title}</p>
                        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>{n.message}</p>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.25rem' }}>{new Date(n.date).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="user-dropdown-wrap" onMouseLeave={() => setDropdownOpen(false)} style={{ position: 'relative' }}>
            <button className="user-nav-btn" onClick={() => setDropdownOpen(!dropdownOpen)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div className="nav-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="nav-user-info" style={{ textAlign: 'left' }}>
                <span className="nav-user-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{user?.fullName?.split(' ')[0]}</span>
                <span className="nav-user-role" style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} style={{ color: '#64748b', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {dropdownOpen && (
              <div className="user-dropdown" style={{ position: 'absolute', right: 0, top: '50px', width: '220px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', zIndex: 200, padding: '0.5rem 0' }}>
                <div className="dropdown-header" style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="dropdown-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.25rem' }}>
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="dropdown-name" style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>{user?.fullName}</p>
                    <p className="dropdown-email" style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</p>
                  </div>
                </div>
                <div style={{ padding: '0.5rem 0' }}>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#334155', textDecoration: 'none', fontSize: '0.875rem' }}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#334155', textDecoration: 'none', fontSize: '0.875rem' }}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#334155', textDecoration: 'none', fontSize: '0.875rem' }}>
                    <Settings size={16} /> Settings
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.5rem 0' }}>
                  <button className="dropdown-item logout-item" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#ef4444', textDecoration: 'none', fontSize: '0.875rem', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
