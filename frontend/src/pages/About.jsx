import React from 'react';
import Navbar from '../components/Navbar';
import './StaticPages.css';

const About = () => {
  return (
    <div className="static-page">
      <Navbar />
      <div className="static-container container">
        <div className="static-header">
          <h1>About Shiksharthee</h1>
          <p>Empowering learners worldwide with accessible, high-quality education.</p>
        </div>
        <div className="static-content">
          <div className="about-section">
            <h2>Our Mission</h2>
            <p>At Shiksharthee, we believe that education is a fundamental right. Our mission is to bridge the gap between eager minds and expert knowledge by providing a platform that is accessible, affordable, and engaging.</p>
          </div>
          <div className="about-section">
            <h2>Our Vision</h2>
            <p>We envision a world where anyone, anywhere can transform their life through learning. We strive to be the leading global platform for skill development and personal growth.</p>
          </div>
          <div className="about-section">
            <h2>Why Choose Us?</h2>
            <ul>
              <li><strong>Expert Instructors:</strong> Learn from industry leaders and experienced educators.</li>
              <li><strong>Interactive Learning:</strong> Engage with quizzes, assignments, and hands-on projects.</li>
              <li><strong>Flexible Schedule:</strong> Learn at your own pace, anytime, anywhere.</li>
              <li><strong>Community Support:</strong> Connect with peers and mentors through our dedicated discussion forums.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
