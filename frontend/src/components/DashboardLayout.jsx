import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Topbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-main">
        <Sidebar isOpen={isSidebarOpen} />
        <div className={`dashboard-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
