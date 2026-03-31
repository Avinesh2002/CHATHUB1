import React from 'react';
import './LandingPage.css';
import robotImage from '../assets/robot.png';

const LandingPage = ({ onStartChat }) => {
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <a className="nav-link" onClick={onStartChat}>
          ChatHub
        </a>
      </nav>

      <main className="hero-content">
        <section className="text-section">
          <h1>CHATHUB</h1>
          <p>
            Build your own AI-powered chatbot using your knowledge and data with ease. 
            Upload documents like PDFs, DOCX, or TXT files and let the chatbot learn 
            and deliver accurate, context-aware answers instantly. Powered by advanced 
            retrieval (RAG), it ensures fast and relevant responses every time. 
            The platform is simple, secure, and requires no coding, making it accessible 
            for businesses, students, and developers. Create, train, and interact 
            with your chatbot through a clean and modern interface designed for 
            efficiency. Start transforming your data into an intelligent assistant 
            today and experience smarter conversations.
          </p>
        </section>

        <section className="image-section">
          <img 
            src={robotImage} 
            alt="AI Robot Illustration" 
            className="robot-illustration"
          />
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
