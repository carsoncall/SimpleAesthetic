const { WebSocketServer } = require('ws');
const uuid = require('uuid');

//MongoDB setup
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const config = require('./dbConfig.json');
const { error } = require('console');
const url = `mongodb+srv://${config["username"]}:${config["password"]}@${config["hostname"]}/?retryWrites=true&w=majority`;
const client = new MongoClient(url);
const aesthetics = client.db('simpleaesthetic').collection('aesthetics');

function peerProxy(httpServer) {
  // Create a websocket object
  const wss = new WebSocketServer({ noServer: true });

  // Handle the protocol upgrade from HTTP to WebSocket
  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

  // Keep track of all the connections so we can forward messages
  let connections = [];

  wss.on('connection', (ws) => {
    const connection = { id: uuid.v4(), alive: true, ws: ws };
    connections.push(connection);

    /**
     * When the server receives a message asking for another aesthetic, send one.
     * The message should be in the format:
     * {"req": "next-aesthetic", "loadedIDs": ["id1", "id2", ...]}
     */
    ws.on('message', async function message(data) {
      const aesthetic = await getNextAesthetic(JSON.parse(data).loadedIDs);
      ws.send(aesthetic);
    });

    // Remove the closed connection
    ws.on('close', () => {
      connections.findIndex((o, i) => {
        if (o.id === connection.id) {
          connections.splice(i, 1);
          return true;
        }
      });
    });

    // Respond to pong messages by marking the connection alive
    ws.on('pong', () => {
      connection.alive = true;
    });
  });

  // Keep active connections alive
  setInterval(() => {
    connections.forEach((c) => {
      // Kill any connection that didn't respond to the ping last time
      if (!c.alive) {
        c.ws.terminate();
      } else {
        c.alive = false;
        c.ws.ping();
      }
    });
  }, 10000);
}

/**
 * This function returns the next aesthetic from the database.
 * @param {Array<String>} loadedIDs 
 * @returns {String} JSON string of the next aesthetic
 */
async function getNextAesthetic(loadedIDs) {
  let count = 0;
  
  loaded = loadedIDs.map(id => new ObjectId(id)); // Convert loaded IDs from strings to ObjectIds
  let nextAesthetic = { _id: {$nin: loaded}}; //queries for documents that have ids NOT in loaded[], which is set by client at each request

  try {
    count = await aesthetics.countDocuments(nextAesthetic); //counting documents (to ensure one exists)
  } catch (e) {
    console.error("Error counting DB documents", e);
    return JSON.stringify({result: "error", error: e});
  }

  if (count === 0) { // if no more documents exist to send
    return JSON.stringify({result: "all out"}); //there are none left
  } else {
    try {
      let aestheticObject = await aesthetics.find(nextAesthetic).limit(1).next(); //returns the aesthetic from the cursor which should only have one document. 
  
      if (aestheticObject) {
        let responseJSOL = {result: "success", 
                            aestheticObject: aestheticObject}; //return the whole object, client will take care of not requesting duplicates
        return JSON.stringify(responseJSOL);
      } else {
        let errorString = "something went wrong with pulling an aesthetic fron the db"
        console.log(errorString);
        return JSON.stringify({result: "error", error: errorString});
      }
    } catch (e) {
      console.log("error fetching aesthetic from the DB", e);
      return JSON.stringify({result: "error", error: e});
    }
  } 
}

module.exports = { peerProxy };
