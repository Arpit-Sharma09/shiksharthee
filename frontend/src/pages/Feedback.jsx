import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { submitFeedback } from '../services/api';
import './StaticPages.css';

const Feedback = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await submitFeedback(formData);
      setStatus({ type: 'success', message: 'Thank you for your feedback!' });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="static-page">
      <Navbar />
      <div className="static-container container">
        <div className="static-header">
          <h1>Provide Feedback</h1>
          <p>Your feedback helps us improve Shiksharthee for everyone.</p>
        </div>
        <div className="feedback-form-container">
          {status.message && (
            <div className={`status-msg ${status.type}`}>
              {status.message}
            </div>
          )}
          <form className="static-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Feedback Message</label>
              <textarea rows="6" placeholder="Tell us what you think..." required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
