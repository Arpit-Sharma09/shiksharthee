import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, User, BookOpen, Calendar, MessageSquare, Plus, X } from 'lucide-react';
import './Messages.css';

const Messages = () => {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    setUser(loggedInUser);
    fetchConversations();
    fetchChatUsers();

    // Auto-refresh chat messages every 3 seconds for simulated live chat!
    const chatInterval = setInterval(() => {
      fetchConversations(true); // silent refresh
    }, 4000);

    return () => clearInterval(chatInterval);
  }, []);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages(activeConvo.id);
    }
  }, [activeConvo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async (silent = false) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data);
      
      if (data.length > 0 && !activeConvo && !silent) {
        setActiveConvo(data[0]);
      } else if (activeConvo) {
        // Refresh active convo messages in background
        const updatedActive = data.find(c => c.id === activeConvo.id);
        if (updatedActive && updatedActive.lastMessage !== activeConvo.lastMessage) {
          fetchMessages(activeConvo.id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/chat/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setChatUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (convoId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/messages/${convoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: activeConvo.otherUser.id,
          text: newMessage,
          convoId: activeConvo.id
        })
      });
      if (res.ok) {
        setNewMessage('');
        fetchMessages(activeConvo.id);
        fetchConversations(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startNewConvo = async (recipientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: recipientId,
          text: 'Hello!',
        })
      });
      if (res.ok) {
        setShowUserList(false);
        setSearchQuery('');
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = chatUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="messages-container">
        {/* Left Sidebar: Conversation List */}
        <div className="messages-sidebar">
          <div className="sidebar-header">
            <h3>Messages</h3>
            <p>Communicate with classmates, teachers, and admins.</p>
            <button className="new-message-btn" onClick={() => setShowUserList(true)} style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Message / Active Users
            </button>
          </div>
          
          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                <MessageSquare size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.85rem' }}>No conversations yet. Start one by clicking "New Message"!</p>
              </div>
            ) : conversations.map(convo => (
              <div 
                key={convo.id} 
                className={`convo-item ${activeConvo?.id === convo.id ? 'active' : ''}`}
                onClick={() => setActiveConvo(convo)}
              >
                <div className="avatar" style={{ position: 'relative' }}>
                  {convo.otherUser?.avatar || convo.otherUser?.fullName?.charAt(0)}
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
                </div>
                <div className="convo-info">
                  <div className="convo-top">
                    <span className="name">{convo.otherUser?.fullName}</span>
                    <span className="time">{new Date(convo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="last-msg">{convo.lastMessage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Chat Window */}
        <div className="chat-window">
          {activeConvo ? (
            <>
              <div className="chat-header">
                <div className="header-info">
                  <div className="avatar" style={{ position: 'relative' }}>
                    {activeConvo.otherUser?.avatar || activeConvo.otherUser?.fullName?.charAt(0)}
                    <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
                  </div>
                  <div>
                    <h4>{activeConvo.otherUser?.fullName}</h4>
                    <span className="status" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 500 }}><span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }}></span> Online</span>
                  </div>
                </div>
                <div className="header-actions">
                  <span className="tag" style={{ textTransform: 'capitalize', background: '#e0e7ff', color: 'var(--primary-color)' }}>{activeConvo.otherUser?.role}</span>
                </div>
              </div>

              <div className="chat-body">
                {messages.map(msg => (
                  <div key={msg.id} className={`message-row ${msg.senderId === user?.id ? 'sent' : 'received'}`}>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form className="chat-footer" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="footer-actions">
                  <button type="submit" className="send-btn"><Send size={20} /></button>
                </div>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <MessageSquare size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <h3>Your Messaging Workspace</h3>
              <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.25rem' }}>Select an active user or click "New Message" to start a live discussion.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Details */}
        {activeConvo && (
          <div className="details-sidebar">
            <div className="tabs">
              <span className="active">User Profile</span>
            </div>
            <div className="profile-card">
              <div className="profile-avatar large">{activeConvo.otherUser?.avatar || activeConvo.otherUser?.fullName?.charAt(0)}</div>
              <h4>{activeConvo.otherUser?.fullName}</h4>
              <p className="role" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: '#6366f1', background: '#ede9fe', padding: '0.25rem 0.75rem', borderRadius: '999px', display: 'inline-block', marginTop: '0.5rem' }}>{activeConvo.otherUser?.role}</p>
            </div>
            <div className="about-section">
              <h5>Registered Email</h5>
              <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#4b5563' }}>{activeConvo.otherUser?.email}</p>
            </div>
            <div className="quick-actions">
              <div className="action-item"><User size={16} /> Shiksharthee verified member</div>
              <div className="action-item"><Calendar size={16} /> Member since May 2026</div>
            </div>
          </div>
        )}

        {/* SELECT ACTIVE USER MODAL */}
        {showUserList && (
          <div className="modal-overlay" onClick={() => setShowUserList(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '450px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MessageSquare size={20} color="var(--primary-color)" /> Start Chat / Active Users</h3>
                <button onClick={() => setShowUserList(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              
              <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                <Search size={18} color="#9ca3af" />
                <input 
                  type="text" 
                  placeholder="Search by name or role (e.g. instructor, student)..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'none', width: '100%', outline: 'none' }}
                />
              </div>

              <div className="instructor-list" style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredUsers.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '1rem' }}>No other registered users found.</p>
                ) : filteredUsers.map(u => (
                  <div 
                    key={u.id} 
                    className="instructor-item" 
                    onClick={() => startNewConvo(u.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="avatar" style={{ position: 'relative', width: '40px', height: '40px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 700 }}>
                      {u.avatar || u.fullName.charAt(0)}
                      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#10b981', border: '2px solid white', borderRadius: '50%' }}></span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p className="name" style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{u.fullName}</p>
                      <p className="role" style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, textTransform: 'capitalize' }}>{u.role}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', background: '#d1fae5', color: '#065f46', borderRadius: '999px', fontWeight: 500 }}>Online</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
