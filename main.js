//Express setup
const express = require('express');
const app = express();

//MongoDB setup
const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');
const { error } = require('console');
const url = `mongodb+srv://${config["username"]}:${config["password"]}@${config["hostname"]}/?retryWrites=true&w=majority`;
const client = new MongoClient(url);
const aesthetics = client.db('simpleaesthetic').collection('aesthetics');
const users = client.db('simpleaesthetic').collection('users');
const sessions = client.db('simpleaesthetic').collection('sessions');

//array of ids of aesthetics that have been already loaded
const loaded = [];

//MongoDB query options
const nextAesthetic = { _id: {$nin: loaded}};

// The service port defaults to 4000 or is read from the program arguments
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Text to display for the service name
const serviceName = process.argv.length > 3 ? process.argv[3] : 'SimpleAesthetic';

// Serve up the static content using middleware
app.use(express.static('public'));

app.get('/next-aesthetic', async (req, res) => {
  // This returns the number of aesthetics that have not been loaded yet.
  let count = 0;
  res.setHeader('Access-Control-Allow-Origin', '*');

  //counting documents (to ensure one exists)
  try {
    count = await aesthetics.countDocuments(nextAesthetic);
  } catch (e) {
    console.error("Error counting DB documents", e);
    res.status(500).send({"result": "error"});
    return;
  }

  // if no more documents exist to send
  if (count === 0) {
    //there are none left
    res.send({"result": "all out"});
    return;
  } 
  
  // If a document exists
  try {
    //returns the aesthetic from the cursor which should only have one document. 
    let aesthetic = await aesthetics.find(nextAesthetic).limit(1).next();

    if (aesthetic) {
      let responseJSOL = {result: "success", 
                          aesthetic: aesthetic};
      res.json(responseJSOL);
      loaded.push(aesthetic['_id']);
    } else {
      let errorString = "something went wrong with pulling an aesthetic fron the db"
      console.error(errorString);
      res.status(500).json({result: "error",
                            error: errorString});
    }
  } catch (e) {
    console.error("error fetching aesthetic from the DB", error);
    res.status(500).send({"result": "error"});
  }
});

app.put('/upload-aesthetic', (req, res) => {
  let newAesthetic = req.body;
  try {
    aesthetics.insertOne(newAesthetic);
    res.send({"result": "success"})
  } catch (e) {
    console.error("Error inserting new aesthetic in the database", e);
    res.send({"result": "fail","error": e});
  }
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
  res.send({ version: '20231128.075705.1', name: serviceName });
});

// Return the homepage if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
