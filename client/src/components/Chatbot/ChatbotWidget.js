import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (isOpen && messages.length === 0 && token) {
      setMessages([{
        type: 'bot',
        text: `Hello ${user.name || 'User'}! I can help with:\n• Attendance\n• Salary\n• Fees\n• Results\n• Calculations`,
        time: new Date().toLocaleTimeString()
      }]);
    }
  }, [isOpen, token, user.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { type: 'user', text: input, time: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const res = await axios.post('http://localhost:5000/api/chatbot/process', 
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { type: 'bot', text: res.data.response, time: new Date().toLocaleTimeString() }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, error occurred.', time: new Date().toLocaleTimeString() }]);
    }
    setLoading(false);
  };

  if (!token) return null;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} style={{
        position: 'fixed', bottom: '20px', right: '20px',
        width: '50px', height: '50px', borderRadius: '50%',
        background: '#667eea', color: 'white', border: 'none',
        fontSize: '24px', cursor: 'pointer', zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        💬
      </button>
      
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '80px', right: '20px',
          width: '300px', height: '400px', background: '#1a1a2e',
          borderRadius: '10px', display: 'flex', flexDirection: 'column',
          zIndex: 1000, border: '1px solid #667eea', boxShadow: '0 5px 20px rgba(0,0,0,0.3)'
        }}>
          <div style={{ padding: '10px', background: '#667eea', color: 'white', borderRadius: '10px 10px 0 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>AI Assistant</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.type === 'user' ? 'right' : 'left' }}>
                <div style={{
                  display: 'inline-block', maxWidth: '80%', padding: '8px 12px',
                  borderRadius: '10px', background: msg.type === 'user' ? '#667eea' : '#2a2a3a',
                  color: 'white', fontSize: '13px'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{msg.text}</pre>
                  <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '4px' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            {loading && <div style={{ textAlign: 'left' }}><div style={{ display: 'inline-block', padding: '8px 12px', background: '#2a2a3a', borderRadius: '10px' }}>Typing...</div></div>}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={{ padding: '10px', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #667eea', background: '#2a2a3a', color: 'white' }}
            />
            <button onClick={sendMessage} style={{ padding: '8px 15px', background: '#667eea', border: 'none', borderRadius: '20px', color: 'white', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;