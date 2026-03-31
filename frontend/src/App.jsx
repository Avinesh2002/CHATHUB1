import React, { useState } from 'react';
import axios from 'axios';
import UploadPanel from './components/UploadPanel';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function App() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm ChatHub. I'm ready to help you analyze your documents. Please upload a PDF, PPTX or TXT file to get started!" }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [indexedFiles, setIndexedFiles] = useState([]);
  const [view, setView] = useState('landing'); // 'landing' or 'chatbot'

  const handleUpload = async (files) => {
    setIsUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIndexedFiles((prev) => {
        // Only append unique files basically, or just take everything newly appended
        const newFiles = [...prev, ...response.data.files];
        return [...new Set(newFiles)];
      });
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `Successfully processed ${response.data.files.length} document(s). You can now ask questions!` }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `Error: ${error.response?.data?.error || error.message}` }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearIndex = async () => {
    try {
      await axios.post(`${API_BASE_URL}/clear`);
      setIndexedFiles([]);
      setMessages([{ role: 'system', text: 'Knowledge base cleared. Please upload new documents.' }]);
    } catch (error) {
      console.error('Failed to clear index', error);
    }
  };

  const handleSendMessage = async (query) => {
    // Add user message to UI
    const userMsg = { role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    
    // Add loading indicator
    setMessages((prev) => [...prev, { role: 'bot', text: '', isTyping: true }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, { query });
      
      // Replace loading message with actual response
      setMessages((prev) => {
        const withoutTyping = prev.filter(m => !m.isTyping);
        return [...withoutTyping, { 
          role: 'bot', 
          text: response.data.answer,
          sources: response.data.sources 
        }];
      });
    } catch (error) {
      // Replace loading message with error
      setMessages((prev) => {
        const withoutTyping = prev.filter(m => !m.isTyping);
        let errorMessage = "An unexpected error occurred.";
        
        if (error.response) {
          // Server responded with a status code outside the 2xx range
          errorMessage = error.response.data?.error || `Server Error (${error.response.status})`;
          if (error.response.status === 504) {
            errorMessage = "Request timed out. Vercel's free plan has a 10-second limit. Please try a shorter question or re-upload your document.";
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "No response from server. Check your connection.";
        } else {
          errorMessage = error.message;
        }

        return [...withoutTyping, { 
          role: 'bot', 
          text: `Error: ${errorMessage}` 
        }];
      });
    }
  };

  if (view === 'landing') {
    return <LandingPage onStartChat={() => setView('chatbot')} />;
  }

  return (
    <div className="app-container">
      <UploadPanel 
        onUpload={handleUpload} 
        isUploading={isUploading} 
        files={indexedFiles} 
        onClear={handleClearIndex}
        onExit={() => setView('landing')}
      />
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage} 
        disabled={indexedFiles.length === 0}
      />
    </div>
  );
}

export default App;
