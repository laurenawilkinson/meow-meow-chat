const HOST = location.origin.replace(/^http/, 'ws'),
                    ws = new WebSocket(HOST),            
                    chat = document.getElementById("chat"),
                    name = document.getElementById("name"),
                    msg = document.getElementById("msg"),
                    btnSend = document.getElementById("send");
            
ws.onopen = () => { 
    console.log('WebSocket connection is open...');
};
ws.onmessage = (e) => { 
    console.log(`received: ${e.data}`);
    const json = JSON.parse(e.data);
    chat.innerHTML = chat.innerHTML + '<p class="sentMsg">' + json.name + ': ' + json.message + '</p>';
};
ws.onclose = () => { 
    console.log('WebSocket has disconnected');
};
ws.onerror = (error) => {
    console.error(error);
};

btnSend.addEventListener("click", sendMsg);
msg.addEventListener("keyup", (e) =>{
    if(e.keyCode === 13){
        sendMsg();
    };
});

function sendMsg(){
    const message = {
        name: name.value,
        message: msg.value
    };
    ws.send(JSON.stringify(message));
    msg.value = '';
}