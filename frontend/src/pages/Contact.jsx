import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Mail, Phone, MapPin } from 'lucide-react';
import './StaticPages.css';

const Contact = () => {
  return (
    <div className="static-page">
      <Navbar />
      <div className="static-container container">
        <div className="static-header">
          <h1>Contact Us</h1>
          <p>We're here to help. Reach out to us with any questions or concerns.</p>
        </div>
        <div className="contact-layout">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>Our dedicated support team is available 24/7 to assist you.</p>
            <div className="info-item">
              <Mail size={20} color="var(--primary-color)" />
              <span>support@shiksharthee.com</span>
            </div>
            <div className="info-item">
              <Phone size={20} color="var(--primary-color)" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="info-item">
              <MapPin size={20} color="var(--primary-color)" />
              <span>123 Learning Ave, Knowledge City, Ed State 10001</span>
            </div>
          </div>
          <div className="contact-form-container">
            <h3>Send us a Message</h3>
            <form className="static-form" onSubmit={async (e) => {
              e.preventDefault();
              const name = e.target[0].value;
              const email = e.target[1].value;
              const subject = e.target[2].value;
              const message = e.target[3].value;
              
              try {
                const res = await fetch('http://localhost:5000/api/feedback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, subject, message })
                });
                if (res.ok) {
                  alert('Thank you! Your message has been sent.');
                  e.target.reset();
                } else {
                  alert('Something went wrong. Please try again.');
                }
              } catch (err) {
                console.error(err);
                alert('Connection error.');
              }
            }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input type="text" placeholder="Subject" required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="Your Message" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
