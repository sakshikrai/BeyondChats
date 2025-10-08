import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import QuizView from './QuizView';

pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedPdf) {
      const fileUrl = `http://localhost:5000/files/${selectedPdf}`;
      setPdfUrl(fileUrl);
      setQuizData(null);
    } else {
      setPdfUrl('');
    }
  }, [selectedPdf]);

  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await axios.post('http://localhost:5000/upload', formData);
      alert('File uploaded successfully!');
      await fetchFiles();
      setSelectedPdf(response.data.filename);
    } catch (error) {
      alert('Error uploading file.');
    }
  };
  
  const handleGenerateQuiz = async () => {
    if (!selectedPdf) return;
    setIsLoadingQuiz(true);
    setQuizData(null);
    try {
      const response = await axios.post('http://localhost:5000/generate-quiz', {
        filename: selectedPdf,
      });
      setQuizData(response.data);
    } catch (error) {
      alert('Failed to generate quiz.');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>Lumina</h1>
          <p>Your Personal Study Companion</p>
        </header>
        <div className="sidebar-content">
          <div className="upload-section">
            <h2>Upload a New PDF</h2>
            <input type="file" onChange={handleFileChange} accept=".pdf" />
            <button onClick={handleUpload} disabled={!selectedFile}>Upload PDF</button>
          </div>
          <hr />
          <div className="selector-section">
            <h2>Select an Existing PDF</h2>
            <select value={selectedPdf} onChange={(e) => setSelectedPdf(e.target.value)}>
              <option value="">-- Select a PDF --</option>
              {uploadedFiles.map(file => (
                <option key={file} value={file}>{file.substring(14)}</option>
              ))}
            </select>
          </div>
          <div className="quiz-section">
            <button onClick={handleGenerateQuiz} disabled={!selectedPdf || isLoadingQuiz}>
              {isLoadingQuiz ? '🧠 Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {quizData ? (
          <QuizView quizData={quizData} onBack={() => setQuizData(null)} />
        ) : (
          <div className="pdf-viewer-container">
            {isLoadingQuiz ? (
              <div className="placeholder"><h2>Generating Your Quiz...</h2><p>The AI is hard at work. This may take a moment.</p></div>
            ) : pdfUrl ? (
              <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <Page key={`page_${index + 1}`} pageNumber={index + 1} renderTextLayer={false}/>
                ))}
              </Document>
            ) : (
              <div className="placeholder"><h2>Select a PDF to begin</h2></div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;