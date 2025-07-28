import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import StatsChart from './components/StatsChart'; 
import TranslateBox from './components/TranslateBox';

const App = () => {
  const [feedbackList, setFeedbackList] = useState([]);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get('/api/feedback');
      setFeedbackList(res.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div style={appWrapper}>
      <h1 style={mainHeading}>🧠 Multilingual Customer Feedback Analyzer</h1>

      <section style={sectionStyle}>
        <StatsChart />
      </section>

      <section style={sectionStyle}>
        <FeedbackForm onSubmitted={fetchFeedback} />
      </section>

      <section style={sectionStyle}>
        <FeedbackList feedback={feedbackList} />
      </section>

      <section style={sectionStyle}>
        <TranslateBox />
      </section>
    </div>
  );
};

// 🖌️ Styles
const appWrapper = {
  padding: '2rem',
  fontFamily: 'Segoe UI, sans-serif',
  backgroundColor: '#f0f2f5',
};

const mainHeading = {
  textAlign: 'center',
  marginBottom: '2rem',
  color: '#333',
};

const sectionStyle = {
  marginBottom: '2.5rem',
  background: '#fff',
  padding: '1.5rem',
  borderRadius: '10px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
};

export default App;
