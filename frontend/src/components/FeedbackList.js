import React from 'react';

const FeedbackList = ({ feedback }) => {
  return (
    <div style={containerStyle}>
      <h2>Submitted Feedback</h2>

      {feedback.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <ul style={listStyle}>
          {feedback.map((item) => (
            <li key={item.id} style={cardStyle}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>{item.product}</strong> — <span style={languageStyle}>{item.language.toUpperCase()}</span>
              </div>

              <div>
                <span style={getSentimentTagStyle(item.sentiment)}>{item.sentiment.toUpperCase()}</span>
              </div>

              <blockquote style={quoteStyle}>
                “{item.text_original}”
              </blockquote>

              <div>
                <small>Translated: {item.text_translated}</small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 🖌️ Styles
const containerStyle = {
  maxWidth: '600px',
  margin: '1rem auto',
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
};

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1rem',
  backgroundColor: '#fefefe',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const languageStyle = {
  fontSize: '0.9rem',
  color: '#555',
};

const quoteStyle = {
  fontStyle: 'italic',
  margin: '0.5rem 0',
  color: '#333',
};

const getSentimentTagStyle = (sentiment) => {
  const base = {
    padding: '0.2rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-block',
    margin: '0.4rem 0',
  };

  switch (sentiment.toLowerCase()) {
    case 'positive':
      return { ...base, backgroundColor: '#d4edda', color: '#155724' };
    case 'neutral':
      return { ...base, backgroundColor: '#e2e3e5', color: '#383d41' };
    case 'negative':
      return { ...base, backgroundColor: '#f8d7da', color: '#721c24' };
    default:
      return base;
  }
};

export default FeedbackList;