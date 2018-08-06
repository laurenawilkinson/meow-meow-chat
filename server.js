//require just server things from the ws (websocket) package, then create the server (wss)
const express = require('express');
const WebSocketServer = require('ws');
const path = require('path');
const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const wss = new WebSocketServer.Server({ server });


// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocketServer.OPEN) {
      // const json = JSON.parse(data);
      // json.clientCount = wss.clients.size;
      // client.send(JSON.stringify(json));
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  let clientCount = wss.clients.size;
  wss.broadcast(clientCount);
  
  ws.on('message', (message) => {
      console.log('received: ', message);
      wss.broadcast(message);
  });
  ws.on('close', () => {
      console.log('Client disconnected');
      clientCount = wss.clients.size;
      wss.broadcast(clientCount);
  });
});
console.log('WebSocket server listening for connection...');

