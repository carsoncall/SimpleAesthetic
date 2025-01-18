const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const config = require('./dbConfig.json');
const { error } = require('console');
const url = `mongodb+srv://${config["username"]}:${config["password"]}@${config["hostname"]}/?retryWrites=true&w=majority`;
const client = new MongoClient(url);
const aesthetics = client.db('simpleaesthetic').collection('aesthetics');

function peerProxy(httpServer) {
  console.log("Starting Proxy...")
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

  let connections = [];

  wss.on('connection', (ws) => {
    const connection = { id: uuid.v4(), alive: true, ws: ws };
    connections.push(connection);
    console.log(`New connection: ${connection.id}`);

    ws.on('message', async function message(data) {
      console.log(`Received message from ${connection.id}: ${data}`);
      try {
        const aesthetic = await getNextAesthetic(JSON.parse(data).loadedIDs);
        ws.send(aesthetic);
        console.log(`Sent aesthetic to ${connection.id}`);
      } catch (e) {
        console.error(`Error processing message from ${connection.id}:`, e);
      }
    });

    ws.on('close', () => {
      connections.findIndex((o, i) => {
        if (o.id === connection.id) {
          connections.splice(i, 1);
          console.log(`Connection closed: ${connection.id}`);
          return true;
        }
      });
    });

    ws.on('pong', () => {
      connection.alive = true;
    });
  });

  setInterval(() => {
    connections.forEach((c) => {
      if (!c.alive) {
        console.log(`Terminating inactive connection: ${c.id}`);
        c.ws.terminate();
      } else {
        c.alive = false;
        c.ws.ping();
      }
    });
  }, 10000);
}

async function getNextAesthetic(loadedIDs) {
  let count = 0;
  console.log(`Fetching next aesthetic, excluding IDs: ${loadedIDs}`);

  loaded = loadedIDs.map(id => new ObjectId(id));
  let nextAesthetic = { _id: {$nin: loaded}};

  try {
    count = await aesthetics.countDocuments(nextAesthetic);
    console.log(`Documents count excluding loaded IDs: ${count}`);
  } catch (e) {
    console.error("Error counting DB documents", e);
    return JSON.stringify({result: "error", error: e});
  }

  if (count === 0) {
    console.log("No more documents to send");
    return JSON.stringify({result: "all out"});
  } else {
    try {
      let aestheticObject = await aesthetics.find(nextAesthetic).limit(1).next();
      if (aestheticObject) {
        let responseJSOL = {result: "success", aestheticObject: aestheticObject};
        console.log("Aesthetic fetched successfully");
        return JSON.stringify(responseJSOL);
      } else {
        let errorString = "Something went wrong with pulling an aesthetic from the DB";
        console.error(errorString);
        return JSON.stringify({result: "error", error: errorString});
      }
    } catch (e) {
      console.error("Error fetching aesthetic from the DB", e);
      return JSON.stringify({result: "error", error: e});
    }
  }
}

module.exports = { peerProxy };
