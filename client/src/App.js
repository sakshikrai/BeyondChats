import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './App.css';
import QuizView from './QuizView';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

function App() {
  const [file, setFile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await fetch('http://localhost:5000/pdfs');
      if (response.ok) {
        const data = await response.json();
        setPdfs(data);
      } else {
        console.error('Failed to fetch PDFs');
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    console.log('File selected in handleFileChange:', selectedFile); // <-- DEBUG LOG 1
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    console.log('handleUpload triggered. Current file state:', file); // <-- DEBUG LOG 2
    if (!file) {
      alert('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('File uploaded successfully');
        setFile(null);
        document.querySelector("input[type='file']").value = "";
        fetchPdfs();
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePdfSelection = (e) => {
    const selected = pdfs.find(pdf => pdf._id === e.target.value);
    setSelectedPdf(selected);
    setNumPages(null);
    setQuiz(null);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedPdf) {
      alert('Please select a PDF first.');
      return;
    }
    setIsLoadingQuiz(true);
    setQuiz(null);
    try {
      const response = await fetch('http://localhost:5000/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId: selectedPdf._id }),
      });
      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
      } else {
        alert('Failed to generate quiz.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Quiz Generator</h1>
      </header>
      <main className="main-content">
        <div className="controls-container">
          <div className="card">
            <h2>Upload a PDF</h2>
            <input type="file" onChange={handleFileChange} accept=".pdf" />
            <button onClick={handleUpload}>Upload</button>
          </div>
          <div className="card">
            <h2>1. Select a Source</h2>
            <select onChange={handlePdfSelection} defaultValue="">
              <option value="" disabled>Choose a PDF</option>
              {pdfs.map((pdf) => (
                <option key={pdf._id} value={pdf._id}>
                  {pdf.originalFilename}
                </option>
              ))}
            </select>
          </div>
          
          {selectedPdf && (
            <div className="card">
              <h2>2. Generate Quiz</h2>
              <button onClick={handleGenerateQuiz} disabled={isLoadingQuiz}>
                {isLoadingQuiz ? 'Generating...' : 'Start Quiz'}
              </button>
            </div>
          )}

          {quiz && (
             <div className="card">
               <QuizView quizData={quiz} />
             </div>
          )}

        </div>
        <div className="pdf-viewer-container">
          {selectedPdf ? (
            <Document
              file={`http://localhost:5000/file/${selectedPdf.savedFilename}`}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </Document>
          ) : (
            <div className="placeholder-text">{!isLoadingQuiz ? 'Select a PDF to view it here.' : 'Generating Quiz...'}</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;