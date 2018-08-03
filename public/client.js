const HOST = location.origin.replace(/^http/, 'ws'),
        ws = new WebSocket(HOST),            
        chat = document.getElementById("chat"),
        name = document.getElementById("name"),
        msg = document.getElementById("msg"),
        btnSend = document.getElementById("send"),
        img = document.getElementById('profileImage'),
        chatMessages = document.getElementsByClassName('msg'),
        colours = document.getElementsByName('colours'),
        customColour = document.getElementById('colour');

pageLoad();

// ws stuff
ws.onopen = () => { 
    console.log('WebSocket connection is open...');
};
ws.onmessage = (e) => { 
    
    const json = JSON.parse(e.data);
    console.log(json);
    if(chatMessages.length < 30){
        chat.innerHTML += 
        `<div class="msg">
            <img src="${json.image}" class="msg-pic">
                <div class="flex-column">
                    <span class="msg-name" style="color: ${json.colour}">${json.name}</span>
                    <span class="msg-message">${json.message}</span>
                </div>
        </div>`;
    }
    

};
ws.onclose = () => { 
    console.log('WebSocket has disconnected');
};
ws.onerror = (error) => {
    console.error(error);
}

// DOM manipulation
btnSend.addEventListener("click", sendMsg);
msg.addEventListener("keyup", (e) =>{
    if(e.keyCode === 13){
        sendMsg();
    }
});

function sendMsg(){
    if (msg.value.length > 1 && msg.value.length <= 250){
        let color = getColour();       
        
        const message = {
            name: name.value,
            message: msg.value,
            image: img.src,
            colour: color
        };
    
        ws.send(JSON.stringify(message));
        msg.value = '';
        msg.autofocus = true;
    }
    else if (msg.value.length <= 1){
        console.error('Your message is too short!');
    }
    else if (msg.value.length > 250){
        console.error('Your message is too long! (max 250 char)');
    }
}

function pageLoad(){
    let r = Math.floor(Math.random() * 5);

    img.src = `images/0${r}.png`;
    
    for (let i = 0, l = colours.length; i < l; i++){
        colours[i].addEventListener('click', () =>{
            customColour.value = colours[i].value;
        });
    }
}



function getColour(){
    let color = '#000';
    if(customColour.value != ''){
        color = customColour.value;
        for (let i = 0, l = colours.length; i < l; i++){
            colours[i].checked = false;
        }
    }

    for (let i = 0, l = colours.length; i < l; i++){
        if (colours[i].checked){
            color = colours[i].value;
        }
    }
    
    return color;
}
