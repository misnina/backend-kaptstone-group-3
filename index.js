const express = require('express');
const db = require('./mockdata.js');
const app = express();
const port = 3000;

//until we get uuid or something going, will just count up on each server reset
let userid = 2;
let messageid = 2;

app.use(express.json());

//need the app.use header starter code

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
