import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, ChevronDown } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo"><BookOpen size={28} color="#fff" /></div>
          <h1>SHIKSHARTHEE</h1>
          <p>Join 10,000+ learners today</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">🎓 Student — Enroll, learn, grow</div>
          <div className="auth-feature-item">👨‍🏫 Instructor — Teach & earn</div>
          <div className="auth-feature-item">🛡️ Admin — Manage everything</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account 🚀</h2>
          <p className="auth-subtitle">Start your free learning journey today</p>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>I am a</label>
              <div className="role-selector">
                {['student', 'instructor', 'admin'].map(r => (
                  <button type="button" key={r}
                    className={`role-btn ${formData.role === r ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: r })}>
                    {r === 'student' ? '🎓' : r === 'instructor' ? '👨‍🏫' : '🛡️'} {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-icon-wrap">
                <User size={18} className="input-left-icon" />
                <input type="text" name="fullName" placeholder="Your full name" value={formData.fullName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <Mail size={18} className="input-left-icon" />
                <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-left-icon" />
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-icon-wrap">
                <Lock size={18} className="input-left-icon" />
                <input type="password" name="confirmPassword" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Register;
