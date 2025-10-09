import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const app = express();
const port = 5000;

// --- OpenAI Setup ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


// --- Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, 'uploads');

app.use(cors());
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsDir));

// --- MongoDB Connection ---
mongoose
  .connect('mongodb://localhost:27017/beyond-chats', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// --- PDF Schema ---
const pdfSchema = new mongoose.Schema({
  originalFilename: String,
  savedFilename: String, // The unique name used for saving the file
  textContent: String,
});

const Pdf = mongoose.model('Pdf', pdfSchema);

// --- Multer Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
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
    console.error(error);
    res.status(500).send('Error processing PDF file.');
  }
});

app.get('/pdfs', async (req, res) => {
  try {
    const pdfs = await Pdf.find({}, 'originalFilename savedFilename');
    res.status(200).json(pdfs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving PDFs.');
  }
});

app.get('/file/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File does not exist:', filePath);
      return res.status(404).send('File not found.');
    }
    res.sendFile(filePath);
  });
});

// New Quiz Generation Endpoint
app.post('/generate-quiz', async (req, res) => {
    const { pdfId } = req.body;

    try {
        const pdfDoc = await Pdf.findById(pdfId);
        if (!pdfDoc) {
            return res.status(404).send('PDF not found.');
        }

        // We'll take the first ~4000 characters for performance.
        // You can adjust this or implement more advanced chunking later.
        const content = pdfDoc.textContent.substring(0, 4000);

        const prompt = `
            Based on the following text, generate a quiz with 3 multiple-choice questions (MCQ),
            2 short-answer questions (SAQ), and 1 long-answer question (LAQ).
            For each MCQ, provide 4 options and indicate the correct answer.
            For all questions, provide a brief explanation for the answer.
            Format the output as a JSON object with a single key "quiz" which is an array of question objects.
            Each question object should have the following structure:
            {
              "type": "MCQ" | "SAQ" | "LAQ",
              "question": "Your question here",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"], // Only for MCQ
              "answer": "The correct answer", // For MCQ, this is one of the options. For SAQ/LAQ, this is the model answer.
              "explanation": "A brief explanation of the answer."
            }

            Text:
            ---
            ${content}
            ---
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
        });

        const quizData = JSON.parse(response.choices[0].message.content);
        res.status(200).json(quizData);

    } catch (error) {
        console.error('Error generating quiz:', error);
        res.status(500).send('Failed to generate quiz.');
    }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});