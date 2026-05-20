import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Clock, FileText, CheckCircle, ChevronLeft, ChevronRight, Bookmark, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import './QuizzesAttempt.css';

const QuizzesAttempt = () => {
  const [selectedOption, setSelectedOption] = useState('A');

  return (
    <DashboardLayout>
      <div className="quiz-header">
        <div className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link> &gt; <Link to="/quizzes">Quizzes</Link> &gt; <span>JavaScript Basics Quiz</span>
        </div>
        <div className="quiz-title-section">
          <div className="title-left">
            <h2>JavaScript Basics Quiz</h2>
            <p>Test your understanding of JavaScript fundamentals.</p>
            <div className="quiz-meta">
              <span><FileText size={16} /> 10 Questions</span>
              <span><Clock size={16} /> 15 Minutes</span>
              <span><CheckCircle size={16} /> 10 Marks</span>
              <span>Instructor: <span className="instructor-name">Mr. Singh</span></span>
            </div>
          </div>
          <div className="time-left-box">
            <span className="time-label">Time Left</span>
            <span className="time-value">12:46</span>
          </div>
        </div>
      </div>

      <div className="quiz-content-layout">
        <div className="quiz-main">
          <div className="question-header">
            <div className="progress-container">
              <span>Question 2 of 10</span>
              <div className="progress-bar-wrap">
                <div className="progress-fill" style={{ width: '20%' }}></div>
              </div>
            </div>
            <span className="marks">2 Marks</span>
          </div>

          <div className="question-body">
            <h3>Which of the following is used to declare a variable in JavaScript?</h3>
            <div className="options-list">
              <label className={`option-item ${selectedOption === 'A' ? 'selected' : ''}`}>
                <input type="radio" name="answer" value="A" checked={selectedOption === 'A'} onChange={(e) => setSelectedOption(e.target.value)} />
                <span className="radio-custom"></span>
                <span className="option-text">A. var</span>
              </label>
              <label className={`option-item ${selectedOption === 'B' ? 'selected' : ''}`}>
                <input type="radio" name="answer" value="B" checked={selectedOption === 'B'} onChange={(e) => setSelectedOption(e.target.value)} />
                <span className="radio-custom"></span>
                <span className="option-text">B. let</span>
              </label>
              <label className={`option-item ${selectedOption === 'C' ? 'selected' : ''}`}>
                <input type="radio" name="answer" value="C" checked={selectedOption === 'C'} onChange={(e) => setSelectedOption(e.target.value)} />
                <span className="radio-custom"></span>
                <span className="option-text">C. constant</span>
              </label>
              <label className={`option-item ${selectedOption === 'D' ? 'selected' : ''}`}>
                <input type="radio" name="answer" value="D" checked={selectedOption === 'D'} onChange={(e) => setSelectedOption(e.target.value)} />
                <span className="radio-custom"></span>
                <span className="option-text">D. variable</span>
              </label>
            </div>
          </div>

          <div className="question-actions">
            <button className="btn btn-outline"><ChevronLeft size={18} /> Previous Question</button>
            <div className="right-actions">
              <button className="btn btn-outline"><Bookmark size={18} /> Mark for Review</button>
              <button className="btn btn-primary">Next Question <ChevronRight size={18} /></button>
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
              <div className="number-box answered">1</div>
              <div className="number-box active">2</div>
              <div className="number-box">3</div>
              <div className="number-box">4</div>
              <div className="number-box answered-light">5</div>
              <div className="number-box">6</div>
              <div className="number-box marked">7</div>
              <div className="number-box">8</div>
              <div className="number-box">9</div>
              <div className="number-box">10</div>
            </div>
          </div>

          <div className="card summary-card">
            <h3>Quiz Summary</h3>
            <div className="summary-row">
              <span>Total Questions</span>
              <strong>10</strong>
            </div>
            <div className="summary-row">
              <span>Total Marks</span>
              <strong>10</strong>
            </div>
            <div className="summary-row">
              <span>Attempted</span>
              <strong>2</strong>
            </div>
            <div className="summary-row">
              <span>Remaining</span>
              <strong>8</strong>
            </div>
            <button className="btn btn-outline end-quiz-btn">End Quiz</button>
            <div className="note-box">
              <strong>Note:</strong> Once you submit the quiz, you won't be able to change your answers.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuizzesAttempt;
