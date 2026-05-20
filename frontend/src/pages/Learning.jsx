import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, PlayCircle, Settings, Maximize, Subtitles, Check, ChevronDown, ChevronUp, Download, Clock, Video, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import './Learning.css';

const Learning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [openSections, setOpenSections] = useState({});
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}`);
      if (!res.ok) throw new Error('Course not found');
      const data = await res.json();
      setCourse(data);
      
      // Setup initial state
      if (data.sections && data.sections.length > 0) {
        const firstSection = data.sections[0];
        setOpenSections({ [firstSection.id]: true });
        if (firstSection.lessons && firstSection.lessons.length > 0) {
          setActiveLesson(firstSection.lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLessonSelect = (lesson, sectionId) => {
    setActiveLesson(lesson);
    setOpenSections(prev => ({ ...prev, [sectionId]: true }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading course...</div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Course not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/courses')} style={{ marginTop: '1rem' }}>Back to Courses</button>
        </div>
      </DashboardLayout>
    );
  }

  // Helper to find next and prev lessons
  let allLessons = [];
  if (course.sections) {
    course.sections.forEach(sec => {
      if (sec.lessons) {
        sec.lessons.forEach(les => {
          allLessons.push({ ...les, sectionId: sec.id });
        });
      }
    });
  }

  const currentIdx = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx !== -1 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <DashboardLayout>
      <div className="learning-breadcrumb">
        <Link to="/dashboard">Dashboard</Link> &gt; <Link to="/courses">Courses</Link> &gt; <span>{course.title}</span> &gt; <span>Learn</span>
      </div>

      <div className="learning-header">
        <div className="learning-title">
          <h2>{activeLesson ? activeLesson.title : course.title}</h2>
          <p>{course.category} &bull; {course.level}</p>
        </div>
        <button className="btn btn-outline btn-sm mark-complete-btn">
          <CheckCircle size={16} /> Mark as Complete
        </button>
      </div>

      <div className="learning-layout">
        <div className="learning-main">
          <div className="video-player-container" style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000' }}>
            {activeLesson && activeLesson.videoUrl ? (
              <iframe 
                src={activeLesson.videoUrl} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={activeLesson.title}
              ></iframe>
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <p>No video available for this lesson.</p>
              </div>
            )}
          </div>

          <div className="learning-tabs" style={{ marginTop: '1.5rem' }}>
            <button className={`tab-btn ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>Overview</button>
            <button className={`tab-btn ${activeTab === 'Notes' ? 'active' : ''}`} onClick={() => setActiveTab('Notes')}>Notes</button>
            <button className={`tab-btn ${activeTab === 'Resources' ? 'active' : ''}`} onClick={() => setActiveTab('Resources')}>Resources</button>
            <button className={`tab-btn ${activeTab === 'Discussions' ? 'active' : ''}`} onClick={() => setActiveTab('Discussions')}>Discussions</button>
          </div>

          <div className="tab-content">
            {activeTab === 'Overview' && (
              <div className="overview-tab">
                <div className="overview-left">
                  <h3>About This Course</h3>
                  <p>{course.description}</p>
                  
                  <h4 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Instructor</h4>
                  <p><strong>{course.instructor}</strong></p>
                </div>
                <div className="overview-right">
                  <div className="lesson-stats">
                    <div className="stat-item">
                      <div className="stat-icon-wrap"><Clock size={18} color="var(--primary-color)" /></div>
                      <div>
                        <span className="stat-label">Duration</span>
                        <span className="stat-val">{course.duration}</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon-wrap"><Video size={18} color="var(--primary-color)" /></div>
                      <div>
                        <span className="stat-label">Lessons</span>
                        <span className="stat-val">{course.totalLessons} Lessons</span>
                      </div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-icon-wrap"><FileText size={18} color="var(--primary-color)" /></div>
                      <div>
                        <span className="stat-label">Language</span>
                        <span className="stat-val">{course.language}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lesson-navigation">
            <button 
              className="btn btn-outline" 
              disabled={!prevLesson}
              onClick={() => prevLesson && handleLessonSelect(prevLesson, prevLesson.sectionId)}
            >
              <ChevronLeft size={18} /> Previous Lesson
            </button>
            <button 
              className="btn btn-primary"
              disabled={!nextLesson}
              onClick={() => nextLesson && handleLessonSelect(nextLesson, nextLesson.sectionId)}
            >
              Next Lesson <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="learning-sidebar">
          <div className="card course-content-card">
            <div className="card-header">
              <h3>Course Content</h3>
            </div>
            <div className="accordion-list">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div className="accordion-item" key={section.id}>
                    <div className="accordion-header" onClick={() => toggleSection(section.id)}>
                      <div className="sec-title">
                        <strong>{idx + 1}. {section.title}</strong>
                      </div>
                      <div className="sec-meta">
                        <span className="sec-progress">{section.lessons ? section.lessons.length : 0} lessons</span>
                        {openSections[section.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                    {openSections[section.id] && section.lessons && (
                      <div className="accordion-body">
                        {section.lessons.map((lesson, lidx) => (
                          <div 
                            className={`lesson-row ${activeLesson && activeLesson.id === lesson.id ? 'active' : ''}`} 
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson, section.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="lesson-icon">
                              <PlayCircle size={16} color={activeLesson && activeLesson.id === lesson.id ? "var(--primary-color)" : "#9ca3af"} />
                            </div>
                            <div className="lesson-info">
                              <span className="lesson-name">{idx + 1}.{lidx + 1} {lesson.title}</span>
                              <span className="lesson-time">{lesson.duration}</span>
                            </div>
                            <div className="lesson-status">
                              {/* Placeholder for real completion tracking */}
                              <CheckCircle size={16} color="#e5e7eb" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                  No sections available.
                </div>
              )}
            </div>
          </div>

          <div className="card resource-card">
            <div className="resource-icon-wrap"><Download size={20} color="var(--primary-color)" /></div>
            <div className="resource-info">
               <h4>Course Resources</h4>
               <a href="#">Download all resources</a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Learning;
