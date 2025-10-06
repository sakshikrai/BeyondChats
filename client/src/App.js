import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

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
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      
      console.log('Server response:', response.data);
      alert(`File uploaded successfully: ${response.data.filename}`);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. See console for details.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BeyondChats PDF Quiz App</h1>
        <p>Select a PDF coursebook to upload.</p>
        
        {/* File input */}
        <input type="file" onChange={handleFileChange} accept=".pdf" />
        
        {/* Upload button */}
        <button onClick={handleUpload}>Upload PDF</button>
      </header>
    </div>
  );
}

export default App;