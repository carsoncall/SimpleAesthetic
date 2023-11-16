const express = require('express');
const app = express();

app.get('/next-aesthetic', (req, res) => {
  res.send(`
  <span id="card-title">Example Aesthetic (placeholder for db info)</span>
          <img id="card-image" src="assets/converted.png">
          <div id="card-palette">
              <div class="card-palette-color" id="card-palette-color1" style="background-color: rgb(251, 241, 199);"></div>
              <div class="card-palette-color" id="card-palette-color2" style="background-color: rgb(239, 219, 178);"></div>
              <div class="card-palette-color" id="card-palette-color3" style="background-color: rgb(177, 98, 134);"></div>
              <div class="card-palette-color" id="card-palette-color4" style="background-color: rgb(131, 165, 152);"></div>
              <div class="card-palette-color" id="card-palette-color5" style="background-color: rgb(104, 157, 106);"></div>
              <div class="card-palette-color" id="card-palette-color6" style="background-color: rgb(69, 133, 136);"></div>
              <div class="card-palette-color" id="card-palette-color7" style="background-color: rgb(80, 73, 69);"></div>
              <div class="card-palette-color" id="card-palette-color8" style="background-color: rgb(40, 40, 40);"></div>
          </div>
  `);
});

app.put('/upload-aesthetic', (req, res) => {
  res.send({ "result": "success (placeholder for when the database is implemented"});
});

//login token -- without cookies
app.get('/login', (req, res) => {
  res.send({ "result": "Congratulations! You have logged in (db placeholder)"});
});

app.get('/create-account', (req, res) => {
  res.send({ "result": "Congratulations! You have logged in (db placeholder)"});
})

const port = 5000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
