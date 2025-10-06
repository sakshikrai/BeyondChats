import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Corrected imports for react-pdf v7+
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Using a static, known-good version of the worker from a CDN
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState('');

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/files');
        setUploadedFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedPdf) {
      const fileUrl = `http://localhost:5000/files/${selectedPdf}`;
      setPdfUrl(fileUrl);
    } else {
      setPdfUrl('');
    }
  }, [selectedPdf]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`File uploaded successfully: ${response.data.filename}`);
      
      setUploadedFiles([...uploadedFiles, response.data.filename]);
      setSelectedPdf(response.data.filename);

    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file.');
    }
  };
  
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>BeyondChats PDF Quiz App</h1>
        
        <div className="upload-section">
          <p>Upload a new PDF coursebook:</p>
          <input type="file" onChange={handleFileChange} accept=".pdf" />
          <button onClick={handleUpload}>Upload PDF</button>
        </div>

        <hr />

        <div className="selector-section">
          <p>Or select an existing PDF:</p>
          <select value={selectedPdf} onChange={(e) => setSelectedPdf(e.target.value)}>
            <option value="">-- Select a PDF --</option>
            {uploadedFiles.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="pdf-viewer">
        {pdfUrl && (
          <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages || 0), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} />
            ))}
          </Document>
        )}
      </div>
    </div>
  );
}

export default App;