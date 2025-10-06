const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json());

// This is the crucial line that was missing. 
// It makes files in the 'uploads' folder accessible via the '/files' URL path.
app.use('/files', express.static(path.join(__dirname, 'uploads')));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// --- Routes ---
app.get('/', (req, res) => {
  res.send('Hello from the BeyondChats server!');
});

app.get('/files', (req, res) => {
  const uploadsDirectory = path.join(__dirname, 'uploads');
  
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Unable to scan files directory." });
    }
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    res.status(200).json(pdfFiles);
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  
  res.status(200).json({
    message: 'File uploaded successfully!',
    filename: req.file.filename
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});