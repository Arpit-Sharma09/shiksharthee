import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <main className="hero-section container">
        <div className="hero-content">
          <h1>Welcome to<br/><span className="highlight">SHIKSHARTHEE</span><br/>E-Learning Platform</h1>
          <p>Learn anytime, anywhere with our comprehensive online courses and interactive learning experience.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
            <Link to="/courses" className="btn btn-outline btn-lg">Explore Courses</Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/hero.png" alt="E-Learning Illustration" />
        </div>
      </main>
    </div>
  );
};

export default Home;
