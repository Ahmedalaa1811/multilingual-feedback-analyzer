import React, { useState } from 'react';
import axios from 'axios';

const TranslateBox = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [translated, setTranslated] = useState('');
  const [detectedLang, setDetectedLang] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTranslate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axios.post('/api/translate', {
        text: text.trim(),
        target_language: targetLang.trim(),
      });
      setTranslated(res.data.translated_text);
      setDetectedLang(res.data.detected_language);
    } catch (err) {
      console.error('❌ Translation failed:', err);
      setErrorMsg('Failed to translate. Please check your input.');
      setTranslated('');
      setDetectedLang('');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translated);
  };

  return (
    <div style={containerStyle}>
      <h2>🌍 Translate Text</h2>
      <form onSubmit={handleTranslate}>
        <textarea
          rows="4"
          placeholder="Enter text to translate"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          style={textareaStyle}
        />

        <input
          type="text"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          placeholder="Target language (e.g. en, fr, ar)"
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading || !text || !targetLang}
          style={buttonStyle}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </form>

      {errorMsg && <p style={errorStyle}>{errorMsg}</p>}

      {translated && (
        <div style={resultContainer}>
          <p>
            <strong>Detected Language:</strong> <code>{detectedLang}</code>
          </p>
          <strong>Translated Text:</strong>
          <div style={translatedBox}>
            {translated}
          </div>
          <button onClick={copyToClipboard} style={copyButtonStyle}>
            📋 Copy
          </button>
        </div>
      )}
    </div>
  );
};

// 🖌️ Styles
const containerStyle = {
  border: '1px solid #ddd',
  padding: '1rem',
  marginTop: '2rem',
  borderRadius: '8px',
  background: '#fafafa',
};

const textareaStyle = {
  width: '100%',
  padding: '0.5rem',
  marginBottom: '0.5rem',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const inputStyle = {
  width: '100%',
  padding: '0.4rem',
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

const errorStyle = {
  color: 'red',
  marginTop: '1rem',
};

const resultContainer = {
  marginTop: '1.5rem',
  padding: '1rem',
  background: '#f5f5f5',
  borderRadius: '6px',
  position: 'relative',
};

const translatedBox = {
  marginTop: '0.5rem',
  background: 'white',
  padding: '0.75rem',
  border: '1px solid #ccc',
  borderRadius: '6px',
  fontFamily: 'monospace',
};

const copyButtonStyle = {
  marginTop: '0.5rem',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default TranslateBox;
