const HOST = location.origin.replace(/^http/, 'ws'),
        ws = new WebSocket(HOST);
        
let chatMessages = [];

// ws stuff
ws.onopen = () => { 
    console.log('WebSocket connection is open...');
};
ws.onmessage = (e) => { 
    const json = JSON.parse(e.data);
    console.log(json);

    if(json.name == undefined){
        app.memberCount = json;
    }
    else{
        let newMsg = 
        `<div class="msg">
            <img src="${json.image}" class="msg-pic">
            <div class="col">
                <span class="msg-name" style="color: ${json.colour}">${json.name}</span>
                <span class="msg-message">${json.message}</span>
            </div>
        </div>`;
        
        chatMessages.push(newMsg);
        if(chatMessages.length > 20){
            chatMessages.shift();
        }

        let chatMsgs = chatMessages.toString().replace(/,/g, '');
        document.getElementById("chat").innerHTML = chatMsgs;
    }
};
ws.onclose = () => { 
    console.log('WebSocket has disconnected');
};
ws.onerror = (error) => {
    console.error(error);
}


// VUE stuff
Vue.component('pic-select', {
    props: ['images'],
    template:
        `   
        <div id="pic-change">
            <p>Change your picture here!</p>
            <img v-for="image in images" class="profile-image" :src="image" @click="$emit('set-image', image)">
        </div>
        `
});

let app = new Vue({
    el: '#app',
    data: {
        clientName: '',
        clientMsg: '',
        colour: 'black',
        members: [],
        memberCount: 0,
        togglePic: false,
        toggleModal: true,
        error: '',
        images: ['images/00.png', 'images/01.png', 'images/02.png', 'images/03.png', 'images/04.png', 'images/05.png', 'images/06.png', 'images/07.png'],
        profileImage: 'images/00.png'
    },
    computed: {
        clientInfo: function (){
            return {
                name: this.clientName,
                image: this.profileImage
            }; 
        }
    },
    methods: {
        joinNamed: function(name){
            if (name != ''){
                this.clientName = name;
                this.toggleModal = false;
            }
            else{
                this.error = 'Enter a name between 1-15 characters'
            }
        },
        joinAnon: function(){
            this.clientName = 'Anonymous Feline';
            this.toggleModal = false;
        },
        sendMsg: function(){
            if (this.clientMsg.length > 1 && this.clientMsg.length <= 250 && this.clientName !== ""){
                const message = {
                    name: this.clientName,
                    message: this.clientMsg,
                    image: this.profileImage,
                    colour: this.colour
                };
            
                ws.send(JSON.stringify(message));
                this.clientMsg = '';
                this.clientMsg.autofocus = true;
            }
            else if (this.clientMsg.length <= 1){
                console.error('Your message is too short!');
            }
            else if (this.clientMsg.length > 250){
                console.error('Your message is too long! (max 250 char)');
            }
            else if (this.clientName == ""){
                console.error('You must have a name to send a message!');
            }
        },
        setImage: function(image){
            this.profileImage = image;
            this.togglePic = false;
        }
    },
    created: function(){
        let r = Math.floor(Math.random() * this.images.length);
        this.setImage(`images/0${r}.png`);
    }
})

