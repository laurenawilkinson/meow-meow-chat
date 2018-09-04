const HOST = location.origin.replace(/^http/, 'ws'),
        ws = new WebSocket(HOST);
        
let chatMessages = [];

// ws stuff
ws.onopen = () => { 
    console.log('WebSocket connection is open...');
    console.log(app.clientInfo);

    // if there are messages in chatMessages (serverside), display them
};
ws.onmessage = (e) => { 
    const json = JSON.parse(e.data);

    if(json.type == 'count'){
        app.memberCount = json.count;
    }
    else if(json.type == 'members'){
        // get last member in the array. that will be this client
        if (app.members.length !== 0 && app.clientID === undefined){
            app.clientInfo = app.members[(app.members.length - 1)];
            app.clientID = app.members[(app.members.length - 1)].id;
        }

        // send members list
        app.members = json.list;
    }
    else if(json.type == 'message'){
        let newMsg = 
        `<div class="msg">
            <img src="${json.image}" class="msg__pic">
            <div class="col">
                <span class="msg__name" style="color: ${json.colour}">${json.name}</span>
                <span class="msg__message">${json.message}</span>
            </div>
        </div>`;
        
        chatMessages.push(newMsg);
        if(chatMessages.length > 20){
            chatMessages.shift();
        }

        let chatMsgs = chatMessages.toString().replace(/,/g, '');
        chat.innerHTML = chatMsgs;
        chat.scrollTop = chat.scrollHeight;
    }
};
ws.onclose = () => { 
    console.log('WebSocket has disconnected');
    app.disconnected = true;
    app.toggleModal = false;
};
ws.onerror = (error) => {
    console.error(error);
}


// VUE stuff
Vue.component('pic-select', {
    props: ['images'],
    template:
        `   
        <div class="modal">
            <h2>Change your picture here!</h2>
            <div class="modal__flex">
                <img v-for="image in images" class="profile-image" :src="image" @click="$emit('set-image', image)">
            </div>
        </div>
        `
});

let app = new Vue({
    el: '#app',
    data: {
        clientName: '',
        clientMsg: '',
        clientColour: '#13c1b9',
        members: [],
        memberCount: 0,
        togglePic: false,
        toggleModal: true,
        toggleName: false,
        disconnected: false,
        notActive: true,
        error: '',
        images: ['images/00.png', 'images/01.png', 'images/02.png', 'images/03.png', 'images/04.png', 'images/05.png', 'images/06.png', 'images/07.png'],
        profileImage: 'images/00.png',
        hint: ''
    },
    computed: {
        clientInfo: {
            get: function (){
                return {
                    type: 'client',
                    name: this.clientName,
                    image: this.profileImage,
                    colour: this.clientColour,
                    id: this.clientID
                }; 
            },
            set: function(json){
                this.clientInfo.name = json.name;
                this.clientInfo.image = json.image;
                this.clientInfo.colour = json.colour;
                this.clientInfo.id = json.id;
            }
        }
    },
    methods: {
        joinNamed: function(name){
            if (name != ''){
                this.setName(name);
                this.toggleModal = false;
                this.notActive = false;
            }
            else{
                this.error = 'Enter a name between 1-15 characters'
            }
        },
        joinAnon: function(){
            this.clientName = 'Anonymous Feline';
            this.toggleModal = false;
            this.notActive = false;
            this.sendClientInfo();
        },
        sendClientInfo: function(){
            ws.send(JSON.stringify(this.clientInfo));
        },
        sendMsg: function(){
            if (this.clientMsg.length > 1 && this.clientMsg.length <= 250 && this.clientName !== ""){
                const message = {
                    type: 'message',
                    name: this.clientName,
                    message: this.clientMsg,
                    image: this.profileImage,
                    colour: this.clientColour
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
            this.sendClientInfo();
        },
        setName: function(name){
            this.clientName = name;
            this.toggleName = false;
            this.sendClientInfo();
        },
        getHint: function(){
            setInterval( () =>{
                // make it so it doesnt do the same hint twice in a row. also add transitions
                let r = Math.floor(Math.random() * 3);
                if (r === 1){
                    this.hint = 'Change your picture by clicking it in the sidebar';
                }
                if (r === 2){
                    this.hint = 'Treat others in the chat with respect';
                }
                if (r === 3){
                    this.hint = 'Change the colour of your message by selecting one from the colour picker'
                }
            }, 10000);
        }
    },
    created: function(){
        let r = Math.floor(Math.random() * this.images.length);
        this.profileImage = `images/0${r}.png`;
        this.togglePic = false;

        this.hint = this.getHint();
    }
})

