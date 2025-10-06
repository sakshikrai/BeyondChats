// At the very top, load environment variables from the .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Initialize OpenAI client ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// --- Middleware ---
app.use(cors()); 
app.use(express.json());
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
    if (err) return res.status(500).json({ message: "Unable to scan files." });
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    res.status(200).json(pdfFiles);
  });
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.status(200).json({ filename: req.file.filename });
});

// --- QUIZ GENERATOR ENDPOINT ---
app.post('/generate-quiz', async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).send('No filename provided.');

  try {
    const filePath = path.join(__dirname, 'uploads', filename);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    const pdfText = data.text;

    const prompt = `
      Based on the following text, generate a quiz with 2 MCQs, 1 SAQ, and 1 LAQ.
      Return the quiz as a single JSON object with the structure:
      {
        "mcqs": [{ "question": "...", "options": ["...", "..."], "answer": "...", "explanation": "..." }],
        "saqs": [{ "question": "...", "answer": "...", "explanation": "..." }],
        "laqs": [{ "question": "...", "answer": "...", "explanation": "..." }]
      }
    `;

    console.log('Sending text to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: pdfText.substring(0, 16000) }
      ],
      response_format: { type: "json_object" },
    });

    const quiz = JSON.parse(completion.choices[0].message.content);
    console.log('Quiz generated!');
    res.status(200).json(quiz);

  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).send('Error generating the quiz.');
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});