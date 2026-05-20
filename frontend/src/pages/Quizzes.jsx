import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { HelpCircle, Brain, Clock, FileText, CheckCircle, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import './StaticPages.css';
import './QuizzesAttempt.css';

const Quizzes = () => {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  // Quiz active state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  useEffect(() => {
    let timer;
    if (quizData && !submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !submitted) {
      submitQuiz();
    }
    return () => clearInterval(timer);
  }, [quizData, submitted, timeLeft]);

  const generateQuiz = async () => {
    if (!topic) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      setQuizData(data);
      setAnswers({});
      setMarkedForReview({});
      setSubmitted(false);
      setScore(0);
      setCurrentQIndex(0);
      setTimeLeft(15 * 60); // Reset to 15 mins
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleOptionSelect = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: optionIdx });
  };

  const toggleMarkForReview = (qId) => {
    if (submitted) return;
    setMarkedForReview(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const submitQuiz = async () => {
    if (!quizData) return;
    let newScore = 0;
    quizData.questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setSubmitted(true);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ topic: quizData.topic, score: newScore, totalQuestions: quizData.questions.length })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!quizData) {
    return (
      <DashboardLayout>
        <div className="container" style={{ padding: '2rem' }}>
          <div className="page-header" style={{ marginBottom: '2rem' }}>
            <h2>AI Generated Quizzes</h2>
            <p>Select a topic to generate a personalized 10-question quiz.</p>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <Brain size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>What do you want to test yourself on?</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. React, JavaScript, HTML..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
              <button className="btn btn-primary" onClick={generateQuiz} disabled={generating || !topic}>
                {generating ? 'Generating...' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = quizData.questions[currentQIndex];
  const attemptedCount = Object.keys(answers).length;
  const remainingCount = quizData.questions.length - attemptedCount;

  return (
    <DashboardLayout>
      <div className="quiz-header">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; <span style={{ cursor: 'pointer', color: 'var(--primary-color)' }} onClick={() => setQuizData(null)}>Quizzes</span> &gt; <span>{quizData.topic} Quiz</span>
        </div>
        <div className="quiz-title-section">
          <div className="title-left">
            <h2>{quizData.topic} Quiz</h2>
            <p>Test your understanding of {quizData.topic} fundamentals.</p>
            <div className="quiz-meta">
              <span><FileText size={16} /> {quizData.questions.length} Questions</span>
              <span><Clock size={16} /> 15 Minutes</span>
              <span><CheckCircle size={16} /> {quizData.questions.length} Marks</span>
              <span>Instructor: <span className="instructor-name">AI Assistant</span></span>
            </div>
          </div>
          <div className="time-left-box">
            <span className="time-label">Time Left</span>
            <span className="time-value" style={{ color: timeLeft < 60 ? '#ef4444' : 'inherit' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="quiz-content-layout">
        <div className="quiz-main">
          <div className="question-header">
            <div className="progress-container">
              <span>Question {currentQIndex + 1} of {quizData.questions.length}</span>
              <div className="progress-bar-wrap">
                <div className="progress-fill" style={{ width: `${((currentQIndex + 1) / quizData.questions.length) * 100}%` }}></div>
              </div>
            </div>
            <span className="marks">1 Mark</span>
          </div>

          <div className="question-body">
            <h3>{currentQ.question}</h3>
            <div className="options-list">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                let optionClass = isSelected ? 'selected' : '';
                
                if (submitted) {
                  if (optIdx === currentQ.correctOption) optionClass = 'selected correct';
                  else if (isSelected) optionClass = 'selected incorrect';
                }

                return (
                  <label key={optIdx} className={`option-item ${optionClass}`} style={submitted && isSelected && optIdx !== currentQ.correctOption ? { borderColor: '#ef4444', backgroundColor: '#fee2e2' } : submitted && optIdx === currentQ.correctOption ? { borderColor: '#22c55e', backgroundColor: '#dcfce7' } : {}}>
                    <input 
                      type="radio" 
                      name="answer" 
                      value={optIdx} 
                      checked={isSelected} 
                      onChange={() => handleOptionSelect(currentQ.id, optIdx)} 
                      disabled={submitted}
                    />
                    <span className="radio-custom" style={submitted && optIdx === currentQ.correctOption ? { borderColor: '#22c55e', backgroundColor: '#22c55e' } : submitted && isSelected && optIdx !== currentQ.correctOption ? { borderColor: '#ef4444', backgroundColor: '#ef4444' } : {}}></span>
                    <span className="option-text" style={submitted && optIdx === currentQ.correctOption ? { color: '#166534' } : submitted && isSelected && optIdx !== currentQ.correctOption ? { color: '#991b1b' } : {}}>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                  </label>
                );
              })}
            </div>
            {submitted && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                <strong>Explanation:</strong> {currentQ.explanation}
              </div>
            )}
          </div>

          <div className="question-actions">
            <button 
              className="btn btn-outline" 
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
            >
              <ChevronLeft size={18} /> Previous Question
            </button>
            <div className="right-actions">
              {!submitted && (
                <button 
                  className={`btn btn-outline ${markedForReview[currentQ.id] ? 'active-marked' : ''}`} 
                  onClick={() => toggleMarkForReview(currentQ.id)}
                  style={markedForReview[currentQ.id] ? { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#b45309' } : {}}
                >
                  <Bookmark size={18} /> {markedForReview[currentQ.id] ? 'Unmark Review' : 'Mark for Review'}
                </button>
              )}
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentQIndex(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                disabled={currentQIndex === quizData.questions.length - 1}
              >
                Next Question <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="quiz-sidebar">
          <div className="card overview-card">
            <h3>Quiz Overview</h3>
            <div className="legend">
              <span><div className="dot answered"></div> Answered</span>
              <span><div className="dot not-answered"></div> Not Answered</span>
              <span><div className="dot marked"></div> Marked</span>
            </div>
            <div className="number-grid">
              {quizData.questions.map((q, idx) => {
                let boxClass = 'number-box';
                if (idx === currentQIndex) boxClass += ' active';
                if (markedForReview[q.id]) boxClass += ' marked';
                else if (answers[q.id] !== undefined) boxClass += ' answered';

                if (submitted) {
                  if (answers[q.id] === q.correctOption) boxClass = 'number-box correct-ans';
                  else boxClass = 'number-box incorrect-ans';
                  if (idx === currentQIndex) boxClass += ' active';
                }

                return (
                  <div key={q.id} className={boxClass} onClick={() => setCurrentQIndex(idx)}>
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            {submitted && (
              <div style={{ marginTop: '1rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                Final Score: {score} / {quizData.questions.length}
              </div>
            )}
          </div>

          <div className="card summary-card">
            <h3>Quiz Summary</h3>
            <div className="summary-row">
              <span>Total Questions</span>
              <strong>{quizData.questions.length}</strong>
            </div>
            <div className="summary-row">
              <span>Total Marks</span>
              <strong>{quizData.questions.length}</strong>
            </div>
            <div className="summary-row">
              <span>Attempted</span>
              <strong>{attemptedCount}</strong>
            </div>
            <div className="summary-row">
              <span>Remaining</span>
              <strong>{remainingCount}</strong>
            </div>
            {!submitted ? (
              <button className="btn btn-outline end-quiz-btn" onClick={submitQuiz} style={{ color: '#ef4444', borderColor: '#ef4444' }}>End Quiz</button>
            ) : (
              <button className="btn btn-primary end-quiz-btn" onClick={() => setQuizData(null)}>Take Another Quiz</button>
            )}
            {!submitted && (
              <div className="note-box">
                <strong>Note:</strong> Once you submit the quiz, you won't be able to change your answers.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Quizzes;
