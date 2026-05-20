import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard, Shield, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

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
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertCircle size={16} color="#f59e0b" />;
      case 'error': return <AlertCircle size={16} color="#ef4444" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"><BookOpen size={22} color="#ffffff" /></div>
          <span className="logo-text">SHIKSHARTHEE</span>
        </Link>

        {/* Nav Links */}
        <ul className="navbar-menu">
          <li><Link to="/" className={isActive('/')}>Home</Link></li>
          <li><Link to="/courses" className={isActive('/courses')}>Courses</Link></li>
          <li><Link to="/about" className={isActive('/about')}>About Us</Link></li>
          <li><Link to="/contact" className={isActive('/contact')}>Contact</Link></li>
          <li><Link to="/feedback" className={isActive('/feedback')}>Feedback</Link></li>
        </ul>

        {/* Right side */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <div className="user-nav-section">
              <div className="notif-wrap" style={{ position: 'relative' }} onMouseLeave={() => setNotifOpen(false)}>
                <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="notif-dot" style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>}
                </button>
                {notifOpen && (
                  <div className="user-dropdown" style={{ right: '-50px', width: '320px', padding: '0', overflow: 'hidden' }}>
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
                          <div>
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
              <div className="user-dropdown-wrap" onMouseLeave={() => setDropdownOpen(false)}>
                <button className="user-nav-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="nav-avatar">{user?.fullName?.charAt(0).toUpperCase() || 'U'}</div>
                  <div className="nav-user-info">
                    <span className="nav-user-name">{user?.fullName?.split(' ')[0]}</span>
                    <span className="nav-user-role">{user?.role}</span>
                  </div>
                  <ChevronDown size={16} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{user?.fullName?.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="dropdown-name">{user?.fullName}</p>
                        <p className="dropdown-email">{user?.email}</p>
                        <span className="dropdown-role-badge">{user?.role}</span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Shield size={16} /> Admin Panel
                      </Link>
                    )}
                    <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={handleLogout}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
