//require just server things from the ws (websocket) package, then create the server (wss)
const express = require('express');
const WebSocketServer = require('ws');
const path = require('path');
const PORT = process.env.PORT || 3000;

const server = express()
  .use(express.static(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


const wss = new WebSocketServer.Server({ server });

let members = {
  type: 'members',
  list: []
};
let ids = [];
let chatMessages = [];

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

const getID = () => {
  let r = Math.floor(Math.random() * 9000);
  if (ids.includes(r)) getID()
  else {
    ids.push(r);
    return r;
  }
}


wss.on('connection', (ws) => {
  const getThisId = (element) => {
    return element.id === ws.id;
  }

  ws.id = getID();
  
  wss.broadcast(JSON.stringify(members));
  ws.send(JSON.stringify({ type: 'messages', list: chatMessages }));
  
  ws.on('message', (message) => {
    console.log('received: ', message);

    // log message in chatMessages array
    let json = JSON.parse(message);
    
    if (json.type == 'client') {
      let thisClientID = members.list.findIndex(getThisId);
      
      if (thisClientID > -1) {
        // search for id
        console.log('exisiting client!');
        
        // update information (name, image)
        members.list[thisClientID].name = json.name;
        members.list[thisClientID].image = json.image;
      }
      else {
        json.id = ws.id;
        members.list.push(json);
        ws.send(JSON.stringify(json))
      }
      wss.broadcast(JSON.stringify(members));
    }
    else {
      chatMessages.push(json)
      if (chatMessages.length > 20) chatMessages.shift();
      wss.broadcast(message);
    }
  });
  ws.on('close', () => {
    console.log('Client disconnected');

    // update members list
    let thisClientID = members.list.findIndex(getThisId);
    members.list.splice(thisClientID, 1);

    wss.broadcast(JSON.stringify(members));
  });
});
console.log('WebSocket server listening for connection...');

