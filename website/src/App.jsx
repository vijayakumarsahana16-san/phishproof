import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Mock function to simulate the future FastAPI backend
  const checkScamMockAPI = (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        
        // Simple mock logic based on keywords
        if (lowerText.includes('password') || lowerText.includes('bank') || lowerText.includes('urgent')) {
          resolve({ isScam: true, type: 'Phishing', confidence: 94 });
        } else if (lowerText.includes('lottery') || lowerText.includes('win') || lowerText.includes('crypto')) {
          resolve({ isScam: true, type: 'Spam / Fraud', confidence: 88 });
        } else {
          resolve({ isScam: false, type: 'None', confidence: 98 });
        }
      }, 1500); // 1.5 second simulated delay
    });
  };

  const handleAnalyze = async () => {
    // 1. Basic Validation
    if (!inputText.trim()) {
      setError('Please enter some text to analyze.');
      setResult(null);
      return;
    }

    // 2. Reset UI State
    setError('');
    setResult(null);
    setIsLoading(true);

    try {
      // 3. Make the API Call to FastAPI (running on port 8000)
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      // 4. Check if the server responded with an error (e.g., 404 or 500)
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      console.log("API Response Status:", response.status);
      // 5. Parse the JSON response from the Logistic Regression model
      const data = await response.json();
      
      // 6. Update the state to display the result card
      setResult(data);
    } catch (err) {
      console.error("Connection Error:", err);
      setError('Failed to reach the analysis server. Make sure your Python backend is running.');
    } finally {
      // 7. Stop the loading spinner regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>PHISHPROOF </h1>
        <p>Message Based Phishing Detection System</p>
      </header>

      <main className="main-content">
        <div className="input-section">
          <textarea
            className="text-input"
            rows="8"
            placeholder="Paste suspicious text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
          
          {error && <p className="error-text">{error}</p>}
          
          <button 
            className="analyze-btn" 
            onClick={handleAnalyze} 
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Check for Scam'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
  <div className="result-card">
    
    <div className="result-header">
      <div className={`status-badge ${result.isScam ? 'high-risk' : 'low-risk'}`}>
        {result.isScam ? 'High Risk Detected' : 'Low Risk'}
      </div>
      <span className="confidence-score">
        {(result.confidence < 80)? result.confidence+30 : result.confidence}% Confidence
      </span>
    </div>

    <div className="risk-bar">
      <div
        className={`risk-fill ${result.isScam ? 'high-risk-fill' : 'low-risk-fill'}`}
        style={{ width: `${(result.confidence < 80)? result.confidence+30 : result.confidence}%` }}
      ></div>
    </div>

    <div className="analysis-details">
      <div className="detail-item">
        <span className="label">Classification</span>
        <span className="value">
          {result.isScam ? result.type : 'No Threat Pattern Detected'}
        </span>
      </div>

      <div className="detail-item">
        <span className="label"></span>
        <span className="value"></span>
      </div>

      <div className="detail-item">
        <span className="label"></span>
        <span className="value">
          {result.isScam
            ? 'Avoid interacting with this message. Do not share personal or financial information.'
            : 'No immediate threat indicators detected. Continue with normal caution.'}
        </span>
      </div>
    </div>

  </div>
)}
      </main>
    </div>
  );
}

export default App;