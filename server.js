//require just server things from the ws (websocket) package, then create the server (wss)
const WebSocketServer = require('ws'),
    wss = new WebSocketServer.Server({port: process.env.PORT});

// Broadcast to all.
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocketServer.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
      console.log('received: ', message);
      //ws.send(message.split('').reverse().join(''));
      const json = JSON.parse(message);
      console.log(json.name);
      console.log(json.message);
      wss.broadcast(message);
  });
  ws.on('close', () => {
      console.log('Client disconnected');
  });
});
console.log('WebSocket server listening for connection...');

