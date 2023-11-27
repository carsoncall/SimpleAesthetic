//Express setup
const express = require('express');
const cors = require('cors');

const app = express();

//MongoDB setup
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const config = require('./dbConfig.json');
const { error } = require('console');
const url = `mongodb+srv://${config["username"]}:${config["password"]}@${config["hostname"]}/?retryWrites=true&w=majority`;
const client = new MongoClient(url);
const aesthetics = client.db('simpleaesthetic').collection('aesthetics');
const users = client.db('simpleaesthetic').collection('users');
const sessions = client.db('simpleaesthetic').collection('sessions');

// The service port defaults to 4000 or is read from the program arguments
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Text to display for the service name
const serviceName = process.argv.length > 3 ? process.argv[3] : 'SimpleAesthetic';

//Allow all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve up the static content using middleware
app.use(express.static('public'));

app.get('/next-aesthetic', async (req, res) => {
  let count = 0;
  res.setHeader('Access-Control-Allow-Origin', '*');

  // If the client has sent a list of loaded aesthetics, use that to filter the query
  let loaded = req.query.loadedIDs ? JSON.parse(req.query.loadedIDs) : [];
  
  // Convert loaded IDs from strings to ObjectIds
  loaded = loaded.map(id => new ObjectId(id));
  
  let nextAesthetic = { _id: {$nin: loaded}}; //queries for documents that have ids NOT in loaded[], which is set by client at each request

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
    let aestheticObject = await aesthetics.find(nextAesthetic).limit(1).next();

    if (aestheticObject) {
      let responseJSOL = {result: "success", 
                          "aestheticObject": aestheticObject}; //return the whole object, client will take care of not requesting duplicates
      res.json(responseJSOL);
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

app.put('/upload-aesthetic', async (req, res) => {
  let newAesthetic = req.body;
  console.log(req);
  try {
    await aesthetics.insertOne(newAesthetic);
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
