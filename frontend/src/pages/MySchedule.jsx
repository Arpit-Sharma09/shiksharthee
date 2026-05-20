import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Clock, BookOpen, FileText, Brain, CalendarDays,
  CheckCircle2, AlertCircle, Timer, RefreshCw, ChevronRight
} from 'lucide-react';
import './MySchedule.css';

const TYPE_CONFIG = {
  assignment: {
    icon: FileText,
    color: '#f59e0b',
    bg: '#fef3c7',
    label: 'Assignment',
  },
  quiz: {
    icon: Brain,
    color: '#8b5cf6',
    bg: '#ede9fe',
    label: 'Quiz',
  },
  class: {
    icon: BookOpen,
    color: '#3b82f6',
    bg: '#eff6ff',
    label: 'Live Class',
  },
};

const STATUS_CONFIG = {
  pending:   { color: '#f59e0b', bg: '#fef3c7', label: 'Pending',   icon: Timer },
  upcoming:  { color: '#3b82f6', bg: '#eff6ff', label: 'Upcoming',  icon: Clock },
  completed: { color: '#10b981', bg: '#dcfce7', label: 'Completed', icon: CheckCircle2 },
  submitted: { color: '#10b981', bg: '#dcfce7', label: 'Submitted', icon: CheckCircle2 },
  overdue:   { color: '#ef4444', bg: '#fee2e2', label: 'Overdue',   icon: AlertCircle },
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function timeUntil(dateStr) {
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Past due';
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h remaining`;
  if (hrs > 0) return `${hrs}h ${mins}m remaining`;
  return `${mins}m remaining`;
}

// Build a 7-day week strip starting from today
function buildWeekDays() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const MySchedule = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState(null);
  const weekDays = buildWeekDays();

  // Redirect non-students
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const fetchSchedule = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/schedule', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchSchedule]);

  // Filter by type
  const filtered = events.filter(e => {
    const typeMatch = activeFilter === 'all' || e.type === activeFilter;
    const dayMatch = selectedDay === null || (() => {
      const ed = new Date(e.dueDate);
      return ed.getDate() === selectedDay.getDate() &&
             ed.getMonth() === selectedDay.getMonth();
    })();
    return typeMatch && dayMatch;
  });

  // Events that fall on each week day (for dot indicators)
  function eventsOnDay(day) {
    return events.filter(e => {
      const ed = new Date(e.dueDate);
      return ed.getDate() === day.getDate() && ed.getMonth() === day.getMonth();
    });
  }

  const counts = {
    all: events.length,
    assignment: events.filter(e => e.type === 'assignment').length,
    quiz: events.filter(e => e.type === 'quiz').length,
    class: events.filter(e => e.type === 'class').length,
  };

  return (
    <DashboardLayout>
      <div className="schedule-page">
        {/* ── Header ── */}
        <div className="schedule-header">
          <div>
            <h2 className="schedule-title">
              <CalendarDays size={28} /> My Schedule
            </h2>
            <p className="schedule-subtitle">
              Your real-time personal learning timetable — classes, assignments & quizzes.
            </p>
          </div>
          <div className="schedule-header-right">
            {lastUpdated && (
              <span className="last-updated">
                <span className="live-dot" /> Live · updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button className="refresh-btn" onClick={fetchSchedule}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* ── Week Strip ── */}
        <div className="week-strip">
          <button
            className={`day-chip ${selectedDay === null ? 'day-active' : ''}`}
            onClick={() => setSelectedDay(null)}
          >
            <span className="day-name">All</span>
            <span className="day-num">{events.length}</span>
          </button>
          {weekDays.map((day, i) => {
            const dayEvents = eventsOnDay(day);
            const isToday = i === 0;
            const isSelected = selectedDay && selectedDay.getDate() === day.getDate();
            return (
              <button
                key={i}
                className={`day-chip ${isSelected ? 'day-active' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDay(isSelected ? null : day)}
              >
                <span className="day-name">{DAY_NAMES[day.getDay()]}</span>
                <span className="day-num">{day.getDate()}</span>
                {dayEvents.length > 0 && (
                  <span className="day-dot-row">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <span key={j} className="day-dot" style={{ background: TYPE_CONFIG[e.type]?.color }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Filter Tabs ── */}
        <div className="schedule-filters">
          {[['all', 'All Events'], ['class', 'Live Classes'], ['assignment', 'Assignments'], ['quiz', 'Quizzes']].map(([val, label]) => (
            <button
              key={val}
              className={`filter-tab ${activeFilter === val ? 'active' : ''}`}
              onClick={() => setActiveFilter(val)}
            >
              {label}
              <span className="filter-count">{counts[val] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* ── Events List ── */}
        <div className="events-list">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
              <p>Loading your schedule…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={64} color="#e2e8f0" />
              <h3>No events found</h3>
              <p>
                {events.length === 0
                  ? 'Enroll in a course to start seeing your schedule here.'
                  : 'No events match the current filter.'}
              </p>
            </div>
          ) : (
            filtered.map(event => {
              const TypeCfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.class;
              const StatusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
              const Icon = TypeCfg.icon;
              const StatusIcon = StatusCfg.icon;

              return (
                <div key={event.id} className={`event-card event-${event.type}`}>
                  <div className="event-type-bar" style={{ background: TypeCfg.color }} />

                  <div className="event-icon-wrap" style={{ background: TypeCfg.bg }}>
                    <Icon size={22} color={TypeCfg.color} />
                  </div>

                  <div className="event-body">
                    <div className="event-top">
                      <span className="event-type-label" style={{ color: TypeCfg.color, background: TypeCfg.bg }}>
                        {TypeCfg.label}
                      </span>
                      <span className="event-status-badge" style={{ color: StatusCfg.color, background: StatusCfg.bg }}>
                        <StatusIcon size={12} /> {StatusCfg.label}
                      </span>
                    </div>

                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-course">{event.course}</p>
                    {event.instructor && <p className="event-instructor">Instructor: {event.instructor}</p>}
                    {event.description && <p className="event-desc">{event.description}</p>}

                    <div className="event-footer">
                      <div className="event-time">
                        <Clock size={14} />
                        <span>{formatDate(event.dueDate)}</span>
                      </div>
                      {event.status !== 'completed' && event.status !== 'submitted' && (
                        <span className={`time-remaining ${event.status === 'overdue' ? 'overdue' : ''}`}>
                          {timeUntil(event.dueDate)}
                        </span>
                      )}
                      {event.score && (
                        <span className="event-score">Score: {event.score}</span>
                      )}
                      {event.maxMarks && (
                        <span className="event-marks">Max: {event.maxMarks} pts</span>
                      )}
                    </div>
                  </div>

                  <button className="event-action-btn">
                    <ChevronRight size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MySchedule;
