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
},
ids = [],
chatMessages = [];


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

function getID() {
  let r = Math.floor(Math.random() * 9000);
  if (ids.includes(r)){
    getID();
  }
  else{
    ids.push(r);
    return r;
  }
}

wss.on('connection', (ws) => {
  ws.id = getID();
  let clientCount = {
    type: 'count',
    count: wss.clients.size
  };
  
  wss.broadcast(JSON.stringify(members));
  wss.broadcast(JSON.stringify(clientCount));
  
  ws.on('message', (message) => {
      console.log('received: ', message);

      // log message in chatMessages array

      let json = JSON.parse(message);
      
      if(json.type == 'client'){
        function getThisId(element){
          return element.id === ws.id;
        }
        let thisClientID = members.list.findIndex(getThisId);
        
        if (thisClientID !== -1){
          // search for id
          console.log('exisiting client!');
          
          // update information (name, image)
          members.list[thisClientID].name = json.name;
          members.list[thisClientID].image = json.image;
        }
        else{
          json.id = ws.id;
          members.list.push(json);
          console.log(members.list);
        }
        wss.broadcast(JSON.stringify(members));
      }
      else {
        wss.broadcast(message);
      }
  });
  ws.on('close', () => {
      console.log('Client disconnected');
      clientCount = {
        type: 'count',
        count: wss.clients.size
      };

      wss.broadcast(JSON.stringify(clientCount))

      // update members list
      function getThisId(element){
        return element.id === ws.id;
      }
      let thisClientID = members.list.findIndex(getThisId);
      console.log(thisClientID)
      members.list.splice(thisClientID, 1);

      wss.broadcast(JSON.stringify(members));
  });
});
console.log('WebSocket server listening for connection...');

