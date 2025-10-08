require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage: storage });

// THIS IS THE MISSING ROUTE
app.get('/', (req, res) => {
  res.send('Hello from the BeyondChats server!');
});

app.get('/files', (req, res) => {
  const uploadsDirectory = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) return res.status(500).json({ message: 'Unable to scan files.' });
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    res.status(200).json(pdfFiles);
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.status(200).json({ filename: req.file.filename });
});

app.post('/generate-quiz', async (req, res) => {
  console.log('Quiz generation request received. Sending mock quiz data.');

  const fakeQuiz = {
    mcqs: [
      {
        question: 'What is the fundamental unit of life?',
        options: ['Atom', 'Molecule', 'Cell', 'Organ'],
        answer: 'Cell',
        explanation: 'The cell is the basic structural and functional unit of all known organisms.',
      },
      {
        question: 'Which of these is a force that opposes motion?',
        options: ['Gravity', 'Friction', 'Magnetism', 'Inertia'],
        answer: 'Friction',
        explanation: 'Friction is the force resisting the relative motion of solid surfaces, fluid layers, and material elements sliding against each other.',
      },
    ],
    saqs: [
      {
        question: 'What is the chemical formula for water?',
        answer: 'H2O',
        explanation: 'A water molecule consists of two hydrogen atoms bonded to a single oxygen atom.',
      },
    ],
    laqs: [
      {
        question: 'Briefly explain Newton\'s First Law of Motion.',
        answer: 'Newton\'s First Law states that an object will remain at rest or in uniform motion in a straight line unless acted upon by an external force.',
        explanation: 'This is also known as the law of inertia.',
      },
    ],
  };

  setTimeout(() => {
    res.status(200).json(fakeQuiz);
  }, 1500);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});