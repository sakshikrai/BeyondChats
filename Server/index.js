

const express = require('express');
const app = express();
const PORT = 5000; 
app.get('/', (req, res) => {
  res.send('Hello World from the BeyondChats server!');
});

app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});