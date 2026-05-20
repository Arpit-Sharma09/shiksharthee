import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser(formData);
      login(data.token, data.user);
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
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
          <p>Your gateway to limitless learning</p>
        </div>
        <div className="auth-features">
          <div className="auth-feature-item">✅ Access 100+ expert-led courses</div>
          <div className="auth-feature-item">✅ Track your learning progress</div>
          <div className="auth-feature-item">✅ Get certified & advance your career</div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to continue your learning journey</p>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
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
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/register">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
};
export default Login;
