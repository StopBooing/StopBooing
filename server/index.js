// index.js
const express = require('express');
const app = express();
const PORT = 3000;

// (예) 루트 경로에 응답
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
