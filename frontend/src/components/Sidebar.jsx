import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, HelpCircle, TrendingUp, User, MessageSquare, Settings, LogOut, Calendar, Megaphone, Flag, Clock, Shield } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) setUserRole(user.role);
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-menu">
        <NavLink to="/dashboard" className="sidebar-item" activeclassname="active">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        {userRole === 'admin' && (
          <NavLink to="/admin" className="sidebar-item" activeclassname="active">
            <Shield size={20} />
            <span>Admin Panel</span>
          </NavLink>
        )}
        <NavLink to={userRole === 'admin' ? "/courses" : "/learning/web-development"} className="sidebar-item" activeclassname="active">
          <BookOpen size={20} />
          <span>{userRole === 'admin' ? 'Courses' : 'My Courses'}</span>
        </NavLink>
        <NavLink to="/assignments" className="sidebar-item" activeclassname="active">
          <FileText size={20} />
          <span>Assignments</span>
        </NavLink>
        <NavLink to="/quizzes" className="sidebar-item" activeclassname="active">
          <HelpCircle size={20} />
          <span>Quizzes</span>
        </NavLink>


        <NavLink to="/progress" className="sidebar-item" activeclassname="active">
          <TrendingUp size={20} />
          <span>Progress</span>
        </NavLink>
        <NavLink to="/messages" className="sidebar-item" activeclassname="active">
          <MessageSquare size={20} />
          <span>Messages</span>
        </NavLink>
        {(userRole === 'admin' || userRole === 'instructor') && (
          <NavLink to="/queries" className="sidebar-item" activeclassname="active">
            <Flag size={20} />
            <span>Queries</span>
            {userRole === 'admin' && (
              <span className="sidebar-badge" style={{marginLeft: 'auto', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px'}}>3</span>
            )}
          </NavLink>
        )}
        <NavLink to="/announcements" className="sidebar-item" activeclassname="active">
          <Megaphone size={20} />
          <span>Announcements</span>
        </NavLink>
        <NavLink to="/calendar" className="sidebar-item" activeclassname="active">
          <Calendar size={20} />
          <span>Calendar</span>
        </NavLink>
        {userRole === 'student' && (
          <NavLink to="/my-schedule" className="sidebar-item" activeclassname="active">
            <Clock size={20} />
            <span>My Schedule</span>
          </NavLink>
        )}
        <NavLink to="/settings" className="sidebar-item" activeclassname="active">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
      
      <div className="sidebar-bottom">
        <NavLink to="/login" className="sidebar-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
