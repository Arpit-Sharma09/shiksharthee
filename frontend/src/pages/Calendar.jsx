import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ChevronLeft, ChevronRight, Video, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = getDaysInMonth(currentYear, currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentYear, currentDate.getMonth());
  const today = new Date();
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && currentDate.getMonth() === today.getMonth() && currentYear === today.getFullYear();
    days.push({ empty: false, date: d, isToday, key: `day-${d}` });
  }
  
  // Fill remaining cells to complete the grid (up to 35 or 42 cells)
  const totalCells = days.length <= 35 ? 35 : 42;
  for (let i = days.length; i < totalCells; i++) {
    days.push({ empty: true, key: `empty-end-${i}` });
  }

  return (
    <DashboardLayout>
      <div className="calendar-header">
        <h2>Calendar & Class Schedule</h2>
        <p>View your classes, deadlines and upcoming events.</p>
      </div>

      <div className="calendar-layout">
        <div className="calendar-main">
          
          <div className="calendar-controls">
            <div className="month-nav">
              <button className="btn btn-outline btn-sm" onClick={handleToday}>Today</button>
              <div className="nav-arrows">
                <button className="btn btn-outline btn-sm icon-only" onClick={handlePrevMonth}><ChevronLeft size={16} /></button>
                <button className="btn btn-outline btn-sm icon-only" onClick={handleNextMonth}><ChevronRight size={16} /></button>
              </div>
              <h3>{currentMonthName} {currentYear}</h3>
            </div>
            <div className="view-toggle">
              <button className="btn btn-primary btn-sm">Month</button>
              <button className="btn btn-outline btn-sm">Week</button>
              <button className="btn btn-outline btn-sm">List</button>
            </div>
          </div>

          <div className="calendar-grid">
            <div className="day-header">Sun</div>
            <div className="day-header">Mon</div>
            <div className="day-header">Tue</div>
            <div className="day-header">Wed</div>
            <div className="day-header">Thu</div>
            <div className="day-header">Fri</div>
            <div className="day-header">Sat</div>

            {days.map((day) => (
              <div className={`day-cell ${day.empty ? 'empty' : ''} ${day.isToday ? 'active-day' : ''}`} key={day.key}>
                {!day.empty && <span className="date">{day.date}</span>}
                {/* Mocking some events dynamically based on date for visual purpose */}
                {!day.empty && day.date === 7 && currentMonthName === 'May' && (
                  <div className="event orange">
                    <span className="event-time">Assignment Due</span>
                    <span className="event-title">Web Development</span>
                  </div>
                )}
                {!day.empty && day.date === 15 && (
                  <>
                    <div className="event blue">
                      <span className="event-time">10:00 AM</span>
                      <span className="event-title">React Class</span>
                    </div>
                    <div className="event purple">
                      <span className="event-time">02:00 PM</span>
                      <span className="event-title">Quiz: JS Basics</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="schedule-section">
            <h3>My Class Schedule</h3>
            <p className="subtitle">Your upcoming live classes</p>
            
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Class</th>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Duration</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>16 May 2024, 10:00 AM</td>
                  <td>React - Components & Props</td>
                  <td>React for Beginners</td>
                  <td>Ms. Verma</td>
                  <td>60 min</td>
                  <td><button className="btn btn-outline btn-sm action-btn"><Video size={14}/> Join Class</button></td>
                </tr>
                <tr>
                  <td>20 May 2024, 11:00 AM</td>
                  <td>CSS Flexbox & Grid</td>
                  <td>Web Development</td>
                  <td>Mr. Sharma</td>
                  <td>60 min</td>
                  <td><button className="btn btn-outline btn-sm action-btn"><Video size={14}/> Join Class</button></td>
                </tr>
                <tr>
                  <td>23 May 2024, 03:00 PM</td>
                  <td>JavaScript DOM Manipulation</td>
                  <td>JavaScript Basics</td>
                  <td>Mr. Singh</td>
                  <td>60 min</td>
                  <td><button className="btn btn-outline btn-sm action-btn"><Video size={14}/> Join Class</button></td>
                </tr>
              </tbody>
            </table>
            <div className="view-full-schedule">
              <a href="#">View Full Schedule →</a>
            </div>
          </div>
        </div>

        <div className="calendar-sidebar">
          
          <div className="card upcoming-classes-card">
            <div className="card-header">
              <h3>Upcoming Classes</h3>
              <a href="#" className="view-all">View all</a>
            </div>
            <div className="list-container">
              
              <div className="list-item">
                <div className="date-badge">
                  <span className="month">MAY</span>
                  <span className="day">16</span>
                </div>
                <div className="item-info">
                  <h4>React - Components & Props</h4>
                  <p>10:00 AM - 11:00 AM</p>
                  <span className="instructor">Ms. Verma</span>
                </div>
                <button className="btn btn-outline btn-sm icon-btn-only"><Video size={16}/></button>
              </div>
              
              <div className="list-item">
                <div className="date-badge">
                  <span className="month">MAY</span>
                  <span className="day">20</span>
                </div>
                <div className="item-info">
                  <h4>CSS Flexbox & Grid</h4>
                  <p>11:00 AM - 12:00 PM</p>
                  <span className="instructor">Mr. Sharma</span>
                </div>
                <button className="btn btn-outline btn-sm icon-btn-only"><Video size={16}/></button>
              </div>

              <div className="list-item">
                <div className="date-badge">
                  <span className="month">MAY</span>
                  <span className="day">23</span>
                </div>
                <div className="item-info">
                  <h4>JavaScript DOM Manipulation</h4>
                  <p>03:00 PM - 04:00 PM</p>
                  <span className="instructor">Mr. Singh</span>
                </div>
                <button className="btn btn-outline btn-sm icon-btn-only"><Video size={16}/></button>
              </div>

            </div>
          </div>

          <div className="card deadlines-card">
            <div className="card-header">
              <h3>Deadlines</h3>
              <a href="#" className="view-all">View all</a>
            </div>
            <div className="list-container">
              
              <div className="list-item">
                <div className="date-badge text-only">
                  <span className="month">MAY</span>
                  <span className="day">17</span>
                </div>
                <div className="item-info">
                  <h4>Project: Landing Page</h4>
                  <p>Due by 11:59 PM</p>
                </div>
                <span className="status-badge orange">Due Soon</span>
              </div>
              
              <div className="list-item">
                <div className="date-badge text-only">
                  <span className="month">MAY</span>
                  <span className="day">28</span>
                </div>
                <div className="item-info">
                  <h4>Assignment: React Components</h4>
                  <p>Due by 11:59 PM</p>
                </div>
                <span className="status-badge orange">Due Soon</span>
              </div>

              <div className="list-item">
                <div className="date-badge text-only">
                  <span className="month">MAY</span>
                  <span className="day">31</span>
                </div>
                <div className="item-info">
                  <h4>Quiz: JavaScript Basics</h4>
                  <p>Due by 11:59 PM</p>
                </div>
                <span className="status-badge green">On Time</span>
              </div>

            </div>
          </div>

          <div className="card legend-card">
            <h3>Calendar Legend</h3>
            <ul className="legend-list">
              <li><div className="dot blue"></div> Live Classes</li>
              <li><div className="dot orange"></div> Assignments</li>
              <li><div className="dot purple"></div> Quizzes</li>
              <li><div className="dot green"></div> Meetings / Sessions</li>
            </ul>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
