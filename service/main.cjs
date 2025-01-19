//Express setup
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { peerProxy } = require('./peerProxy.cjs');

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

const port = process.argv.length > 2 ? process.argv[2] : 3000; // The service port defaults to 4000 or is read from the program arguments
const serviceName = process.argv.length > 3 ? process.argv[3] : 'SimpleAesthetic'; // Text to display for the service name

app.use(cors()); //Allow all origins -- TODO: verify this is safe
app.use(express.json({ limit: '50mb'})); // Parse JSON bodies
app.use(express.static('dist')); // Serve up the static content using middleware

const currentSessions = {};

//** HELPER FUNCTIONS **//

/**
 * Logs messages to the console if NODE_ENV is 'development'
 * @param  {...any} args The messages or objects to log
 */
function devLog(...args) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}

/**
 * Logs error messages to the console if NODE_ENV is 'development'
 * @param  {...any} args The error messages or objects to log
 */
function devError(...args) {
  if (process.env.NODE_ENV === 'development') {
    console.error(...args);
  }
}

/**
 * Generates a random session token
 * @returns {string} A random session token
 */
function sessionTokenGenerator() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Updates the user's document in the database with the new aesthetic's ID
 * @param {string} username The username of the user to update
 * @param {string} aestheticID The ID of the new aesthetic
 */
function updateAestheticsIDs(username, aestheticID) {
  devLog(`Updating aesthetics IDs for user: ${username} with new aesthetic ID: ${aestheticID}`);
  try {
    users.updateOne({"username": username}, {$push: {"aestheticsIDs": aestheticID}});
  } catch (e) {
    devError("Error updating user's aestheticsIDs", e);
  }
}

//** ROUTES **//

// Get the next aesthetic from the database. Called with the infinite scroll function in discover.js.
app.get('/next-aesthetic', async (req, res) => {
  devLog('Received request for /next-aesthetic');
  let count = 0;
  
  // If the client has sent a list of loaded aesthetics, use that to filter the query
  let loaded = req.query.loadedIDs ? JSON.parse(req.query.loadedIDs) : [];
  devLog('Loaded IDs:', loaded);
  
  // Convert loaded IDs from strings to ObjectIds
  loaded = loaded.map(id => new ObjectId(id));
  
  let nextAesthetic = { _id: {$nin: loaded}}; //queries for documents that have ids NOT in loaded[], which is set by client at each request

  //counting documents (to ensure one exists)
  try {
    count = await aesthetics.countDocuments(nextAesthetic);
    devLog('Count of next aesthetics:', count);
  } catch (e) {
    devError("Error counting DB documents", e);
    res.status(500).send({"result": "error"});
    return;
  }
  // if no more documents exist to send
  if (count === 0) {
    //there are none left
    devLog('No more aesthetics to send');
    res.send({"result": "all out"});
    return;
  } 
  // If a document exists
  try {
    //returns the aesthetic from the cursor which should only have one document. 
    let aestheticObject = await aesthetics.find(nextAesthetic).limit(1).next();
    devLog('Fetched aesthetic object:', aestheticObject);

    if (aestheticObject) {
      let responseJSOL = {result: "success", 
                          "aestheticObject": aestheticObject}; //return the whole object, client will take care of not requesting duplicates
      res.json(responseJSOL);
    } else {
      let errorString = "something went wrong with pulling an aesthetic fron the db"
      devError(errorString);
      res.status(500).json({result: "error",
                            error: errorString});
    }
  } catch (e) {
    devError("error fetching aesthetic from the DB", error);
    res.status(500).send({"result": "error"});
  }
});


// Upload a new aesthetic to the database. Called with the upload button in index.js. Must be logged in.
app.put('/upload-aesthetic', async (req, res) => {
  devLog('Received request for /upload-aesthetic');
  let sessionToken = req.headers.sessiontoken;
  devLog('Session token:', sessionToken);
  if (currentSessions.hasOwnProperty(sessionToken)) {
    let newAesthetic = req.body;
    devLog('New aesthetic:', newAesthetic);
    try {
      let result = await aesthetics.insertOne(newAesthetic);
      let newAestheticID = result.insertedId;
      devLog('Inserted new aesthetic with ID:', newAestheticID);
      updateAestheticsIDs(currentSessions[sessionToken], newAestheticID);
      res.send({"result": "success"})
    } catch (e) {
      devError("Error inserting new aesthetic in the database", e);
      res.send({"result": "fail","error": e});
    }
  } else {
    devError("Error: session token not found. Please log in again.");
    res.send({"result": "error", "error": "session token not found. Please log in again."});
  }
});


//login, and receive a session token. Called with the login button in login.js. Uses express-session.
app.get('/login', (req, res) => {
  devLog('Received request for /login');
  const {username, password} = req.headers;
  devLog('Username:', username);
  if (username && password) { // if the user has provided a username and password
    //check the database for a matching username and password
    users.findOne({"username": username, "password": password})
    .then(result => {
      if (result) { // if the username and password match
        //create a session for the user
        const sessionToken = sessionTokenGenerator();
        devLog('Generated session token:', sessionToken);
        currentSessions[sessionToken] = username;
        res.send({"result": "success", "sessionToken": sessionToken});
      } else { // if the username and password do not match
        devLog('Username and password do not match');
        res.send({"result": "error", "error": "username and password do not match. Try again!"});
      }
    })
    .catch(error => {
      devError("Error finding user in database", error);
      res.send({"result": "error", "error": error});
    });
  } else {
    devLog('Username and password required');
    res.send({"result": "error", "error": "username and password required"});
  }
});

app.put('/create-account', async (req, res) => {
  devLog('Received request for /create-account');
  const { username, password } = req.body;
  devLog('Username:', username);
  if (username && password) { // if the user has provided a username and password
    
    if (await users.findOne({"username": username})) { // if the username is already taken
      devLog('Username already taken');
      res.json({"result": "error", "error": "username already taken"});
    } 
    else { // if the username is not taken, create the document to insert into the database
      const user = {username: username, 
                    password: password,
                    aestheticsIDs: []};
      try {
        await users.insertOne(user);
        devLog('Account created for username:', username);
        res.json({"result": "success"});
      } catch (e) {
        devError("Error creating account", e);
        res.json({"result": "error", "error": e});
      }
    }

  } else {
    devLog('Username and password required');
    res.json({"result": "error", "error": "username and password required"});
  }
})

// Provide the version of the application
app.get('/config', (_req, res) => {
  devLog('Received request for /config');
  res.send({ version: '20231128.075705.1', name: serviceName });
});

// Return the homepage if the path is unknown
app.use((_req, res) => {
  devLog('Unknown path, returning homepage');
  res.sendFile('index.html', { root: 'dist' });
});

const webserver = app.listen(port, function () {
  devLog(`Listening on port ${port}`);
});

devLog("Starting proxy")
peerProxy(webserver);
