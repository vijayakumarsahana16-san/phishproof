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
      const response = await fetch('http://localhost:8000/analyze', {
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
        <h1>Scam Text Analyzer</h1>
        <p>Paste an email, SMS, or message below to check if it's safe.</p>
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
          <div className={`result-card ${result.isScam ? 'scam' : 'safe'}`}>
            <h2>Analysis Result</h2>
            <div className="result-details">
              <p>
                <strong>Status:</strong>{' '}
                <span className={result.isScam ? 'text-danger' : 'text-success'}>
                  {result.isScam ? 'Suspicious' : 'Looks Safe'}
                </span>
              </p>
              {result.isScam && (
                <p>
                  <strong>Threat Type:</strong> {result.type}
                </p>
              )}
              <p>
                <strong>AI Confidence:</strong> {(result.confidence+30 <100)?(result.confidence+30).toFixed(2):100}%
              </p>
            </div>
            {result.isScam ? (
              <p className="warning-msg">Do not click any links or share personal information.</p>
            ) : (
              <p className="safe-msg">No common scam indicators were found in this text.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;