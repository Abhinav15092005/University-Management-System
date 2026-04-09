import React, { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';
import { FaRobot, FaTimes, FaSend } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { playSound } = useSound();

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        type: 'bot',
        text: `Hello ${user.name}! 👋 I'm your AI assistant. Ask me about attendance, salary, fees, marks, or calculations. How can I help you today?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, user.name, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    playSound('message-sent');
    
    try {
      const response = await axios.post('/api/chatbot/process', {
        message: inputMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const botMessage = {
        type: 'bot',
        text: response.data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      playSound('message-received');
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <div className="chatbot-toggle" onClick={() => {
        setIsOpen(!isOpen);
        playSound('click');
      }}>
        <FaRobot size={24} />
      </div>
      
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-content">
              <FaRobot className="header-icon" />
              <div>
                <h3>AI Assistant</h3>
                <p>Online</p>
              </div>
            </div>
            <FaTimes className="close-icon" onClick={() => setIsOpen(false)} />
          </div>
          
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}`}>
                <div className="message-content">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {msg.text}
                  </pre>
                  <div className="timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me anything in Indian English..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={sendMessage}>
              <FaSend />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;