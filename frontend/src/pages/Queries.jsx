import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Mail, MessageSquare, Clock, User, CheckCircle, ExternalLink, Filter } from 'lucide-react';
import './StaticPages.css';

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      navigate('/dashboard');
      return;
    }
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/feedback', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQueries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/feedback/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchQueries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQueries = Array.isArray(queries) ? (filter === 'all' ? queries : queries.filter(q => q.status === filter)) : [];

  return (
    <DashboardLayout>
      <div className="container" style={{ padding: '2rem' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={28} color="var(--primary-color)" /> Support Queries
            </h2>
            <p style={{ color: '#64748b' }}>Manage user inquiries and feedback from the contact form.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Filter size={18} color="#64748b" />
            <select className="form-control" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">All Queries</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="queries-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {loading ? <p>Loading queries...</p> : filteredQueries.length === 0 ? <p>No queries found.</p> : filteredQueries.map(query => (
            <div key={query.id} className="card" style={{ padding: '1.5rem', borderRadius: '12px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{query.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>{query.email}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    background: query.status === 'open' ? '#fef3c7' : '#dcfce7',
                    color: query.status === 'open' ? '#92400e' : '#166534'
                  }}>
                    {(query.status || 'open').toUpperCase()}
                  </span>
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {new Date(query.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>Subject: {query.subject || 'General Inquiry'}</p>
                <p style={{ fontSize: '0.9375rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{query.message}</p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <a href={`mailto:${query.email}?subject=Re: ${query.subject}`} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', textDecoration: 'none' }}>
                  <Mail size={16} /> Reply via Email
                </a>
                {query.status !== 'closed' && (
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
                    onClick={() => handleStatusUpdate(query.id, 'closed')}
                  >
                    <CheckCircle size={16} /> Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Queries;
