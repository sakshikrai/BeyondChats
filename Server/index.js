import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const app = express();
const port = 5000;

// --- Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// --- MongoDB Connection ---
mongoose
  .connect('mongodb://localhost:27017/beyond-chats', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// --- Schemas ---
const pdfSchema = new mongoose.Schema({
  originalFilename: String,
  savedFilename: String,
  textContent: String,
});
const Pdf = mongoose.model('Pdf', pdfSchema);

const quizAttemptSchema = new mongoose.Schema({
  pdfName: String,
  score: Number,
  total: Number,
  createdAt: { type: Date, default: Date.now },
});
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

// --- Multer Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// --- API Endpoints ---
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const dataBuffer = fs.readFileSync(req.file.path);
  try {
    const data = await pdf(dataBuffer);
    const newPdf = new Pdf({
      originalFilename: req.file.originalname,
      savedFilename: req.file.filename,
      textContent: data.text,
    });
    await newPdf.save();
    res.status(200).send('File uploaded and processed successfully.');
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).send('Error processing PDF file.');
  }
});

app.get('/pdfs', async (req, res) => {
  try {
    const pdfs = await Pdf.find({}, 'originalFilename savedFilename');
    res.status(200).json(pdfs);
  } catch (error) {
    console.error('Error retrieving PDFs:', error);
    res.status(500).send('Error retrieving PDFs.');
  }
});

app.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('File not found.');
    }
    res.sendFile(filePath);
  });
});

// MOCKED Quiz Generation Endpoint with 25 Questions
app.post('/generate-quiz', async (req, res) => {
    console.log("Generating mock quiz with 25 questions...");
    const mockQuiz = {
        "quiz": [
            // ... (25 questions from the previous step) ...
        ]
    };
    setTimeout(() => res.status(200).json(mockQuiz), 1500);
});

// --- Progress Tracking Endpoints ---
app.post('/save-attempt', async (req, res) => {
  try {
    const { pdfName, score, total } = req.body;
    const newAttempt = new QuizAttempt({ pdfName, score, total });
    await newAttempt.save();
    res.status(201).send('Attempt saved successfully.');
  } catch (error) {
    console.error('Error saving attempt:', error);
    res.status(500).send('Failed to save attempt.');
  }
});

app.get('/attempts', async (req, res) => {
  try {
    const attempts = await QuizAttempt.find().sort({ createdAt: -1 });
    res.status(200).json(attempts);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).send('Failed to fetch attempts.');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});