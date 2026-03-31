import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Brain, User, AlertCircle } from 'lucide-react';
const ChatInterface = ({ messages, onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="chat-container">

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'system' && (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'}}>
                <AlertCircle size={16} /> {msg.text}
              </div>
            )}
            
            {msg.role !== 'system' && (
              <div style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                <div style={{marginTop: '4px'}}>
                  {msg.role === 'bot' ? <Brain size={20} className={msg.isTyping ? "brain-pulse" : ""} /> : <User size={20} />}
                </div>
                <div className="message-content" style={{flex: 1, minWidth: 0}}>
                  {msg.isTyping ? (
                    <div className="typing-indicator">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  ) : (
                    <>
                      {msg.role === 'user' ? (
                         <div style={{lineHeight: '1.5'}}>{msg.text}</div>
                      ) : (
                         <ReactMarkdown>{msg.text}</ReactMarkdown>
                      )}
                      
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="message-sources">
                          <h4>Sources:</h4>
                          {msg.sources.map((src, i) => (
                            <div key={i} className="source-item" title={src.page_content}>
                              • {src.source}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Upload a document to start asking questions..." : "Ask a question..."}
            disabled={disabled}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || disabled}>
            <Send size={20} color={!input.trim() || disabled ? "#888" : "#000"} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
