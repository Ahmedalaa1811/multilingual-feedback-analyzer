import React, { useState, useRef } from 'react';
import axios from 'axios';

const FeedbackForm = ({ onSubmitted }) => {
  const [text, setText] = useState('');
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await axios.post('/api/feedback', { text, product });
      setText('');
      setProduct('');
      onSubmitted(); // refresh feedback list
      setMessage('✅ Feedback submitted successfully!');
      textareaRef.current?.focus();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('❌ Failed to submit feedback. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>Submit Feedback</h2>

      <textarea
        ref={textareaRef}
        rows="4"
        placeholder="Write feedback in any language..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="text"
        placeholder="Product name"
        value={product}
        onChange={(e) => setProduct(e.target.value)}
        required
        style={inputStyle}
      />

      <button type="submit" disabled={loading || !text || !product} style={buttonStyle}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {message && <p style={messageStyle}>{message}</p>}
    </form>
  );
};

// 🖌️ Simple inline styles
const formStyle = {
  maxWidth: '400px',
  margin: '0 auto',
  padding: '1rem',
  border: '1px solid #ccc',
  borderRadius: '8px',
  background: '#f9f9f9',
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '0.75rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const messageStyle = {
  marginTop: '1rem',
  fontWeight: 'bold',
  color: '#333',
};

export default FeedbackForm;