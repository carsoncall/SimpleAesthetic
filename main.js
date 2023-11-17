const express = require('express');
const app = express();

// The service port defaults to 4000 or is read from the program arguments
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Text to display for the service name
const serviceName = process.argv.length > 3 ? process.argv[3] : 'SimpleAesthetic';

// Serve up the static content using middleware
app.use(express.static('public'));

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

// Provide the version of the application
app.get('/config', (_req, res) => {
  res.send({ version: '20221228.075705.1', name: serviceName });
});

// Return the homepage if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
