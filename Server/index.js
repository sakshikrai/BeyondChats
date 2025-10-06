const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors()); 
app.use(express.json());


app.use('/files', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
   
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });



app.get('/', (req, res) => {
  res.send('Hello from the BeyondChats server!');
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