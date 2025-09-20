import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [originalWordCount, setOriginalWordCount] = useState(0);

  // Update word count when input text changes
  useEffect(() => {
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
    setWordCount(words);
  }, [inputText]);

  // Update original word count when summary is generated
  useEffect(() => {
    if (summary) {
      const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
      setOriginalWordCount(words);
    }
  }, [summary, inputText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setSummary('');
    setError('');
    setWordCount(0);
    setOriginalWordCount(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) {
      setError('Silakan masukkan teks yang ingin dirangkum.');
      return;
    }

    if (inputText.trim().split(/\s+/).length < 50) {
      setError('Teks terlalu pendek. Silakan masukkan minimal 50 kata untuk hasil rangkuman yang optimal.');
      return;
    }

    setSummary('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal merangkum teks.');
      }

      const data = await response.json();
      setSummary(data.summary);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getSummaryWordCount = () => {
    return summary.trim() === '' ? 0 : summary.trim().split(/\s+/).length;
  };

  const getCompressionRatio = () => {
    if (originalWordCount === 0 || !summary) return 0;
    return Math.round(((originalWordCount - getSummaryWordCount()) / originalWordCount) * 100);
  };

  return (
    <>
      {/* Floating background text decorations */}
      <div className="text-decoration">
        "Artificial Intelligence revolutionizes how we process and understand vast amounts of textual information..."
      </div>
      <div className="text-decoration">
        "Machine learning algorithms can identify key patterns and extract meaningful insights from complex documents..."
      </div>
      <div className="text-decoration">
        "Natural language processing enables computers to understand, interpret, and generate human language..."
      </div>
      <div className="text-decoration">
        "Text summarization helps users quickly grasp essential information from lengthy articles and research papers..."
      </div>
      
      <div className="container">
      <header>
        <h1 className="brand-title">
          <span className="brand-cerna">Cerna</span>
          <span className="brand-in">in</span>
        </h1>
        <p>🚀 Rangkum artikel atau teks panjang dengan AI yang powerful</p>
      </header>
      
      <main>
        <div className="input-section">
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder="Ketik atau tempel teks di sini... (minimal 50 kata untuk hasil optimal)"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            
            <div className="word-count">
              {wordCount} kata {wordCount < 50 && wordCount > 0 && '(minimal 50 kata)'}
            </div>

            <div className="button-group">
              <button 
                type="submit" 
                className="primary-btn"
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <>
                    Sedang Meringkas...
                    <span className="loading-spinner"></span>
                  </>
                ) : (
                  '✨ Rangkum Teks'
                )}
              </button>
              
              <button 
                type="button" 
                className="secondary-btn"
                onClick={handleClear}
                disabled={isLoading}
              >
                🗑️ Hapus Semua
              </button>
            </div>
          </form>
        </div>

        {summary && (
          <div className="summary-result">
            <div className="summary-header">
              <h2>📝 Hasil Rangkuman</h2>
              <button 
                onClick={handleCopy} 
                className={`copy-btn ${isCopied ? 'copied' : ''}`}
                disabled={isCopied}
              >
                {isCopied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            
            <p className="summary-text">{summary}</p>
            
            <div className="stats-info">
              <span>📊 Teks asli: {originalWordCount} kata</span>
              <span>📝 Rangkuman: {getSummaryWordCount()} kata</span>
              <span>📈 Kompresi: {getCompressionRatio()}%</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-result">
            <p><strong>⚠️ Error:</strong> {error}</p>
          </div>
        )}
      </main>
    </div>
    </>
  );
}

export default App;