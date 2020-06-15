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

Vue.component('chat-modal', {
  props: [ 'title' ],
  template: `
    <div class="modal-overlay">
      <div class="modal">
        <h2>{{ title }}</h2>
        <slot></slot>
      </div>
    </div>
  `
})

Vue.component('chat-message', {
  props: [ 'message' ],
  template: `
    <div class="msg">
      <img :src="message.image" class="msg__pic">
      <div class="col">
          <span class="msg__name" :style="{ color: message.colour }">{{ message.name }}</span>
          <span class="msg__message">{{ message.message }}</span>
      </div>
    </div>`
})

let app = new Vue({
  el: '#app',
  data: {
    HOST: location.origin.replace(/^http/, 'ws'),
    ws: null,
    chatMessages: [],
    clientName: '',
    clientMsg: '',
    clientId: null,
    clientColour: '#13c1b9',
    members: [],
    togglePic: false,
    toggleModal: true,
    toggleName: false,
    disconnected: false,
    notActive: true,
    error: '',
    images: ['images/00.png', 'images/01.png', 'images/02.png', 'images/03.png', 'images/04.png', 'images/05.png', 'images/06.png', 'images/07.png'],
    profileImage: 'images/00.png',
    hint: '',
    hints: [
      'Change your picture by clicking it in the sidebar',
      'Treat others in the chat with respect',
      'Change the colour of your message by using the colour picker'
    ]
  },
  computed: {
    clientInfo: {
      get () {
        return {
          type: 'client',
          name: this.clientName,
          image: this.profileImage,
          colour: this.clientColour,
          id: this.clientId
        }; 
      },
      set (json) {
        this.clientName = json.name;
        this.profileImage = json.image;
        this.clientColour = json.colour;
        this.clientId = json.id;
      }
    }
  },
  methods: {
    joinChat (name) {
      if (!name.length || name.length > 15) 
        return this.error = 'Enter a name between 1-15 characters';
      
      this.toggleModal = false;
      this.notActive = false;
      this.setName(name);

      this.$refs.chatInput.focus();
    },
    sendClientInfo () {
      console.log('sending client info...', this.clientInfo)
      this.ws.send(JSON.stringify(this.clientInfo));
    },
    sendMsg () {
      if (this.clientMsg.length <= 1)
        return console.error('Your message is too short!');
      else if (this.clientMsg.length > 250)
        return console.error('Your message is too long! (max 250 char)');
      else if (this.clientName == "")
        return console.error('You must have a name to send a message!');
      
      const message = {
        type: 'message',
        name: this.clientName,
        message: this.clientMsg,
        image: this.profileImage,
        colour: this.clientColour
      };
  
      this.ws.send(JSON.stringify(message));
      this.clientMsg = '';
      this.clientMsg.autofocus = true;
    },
    setImage (image) {
      this.profileImage = image;
      this.togglePic = false;
      this.sendClientInfo();
    },
    setName (name) {
      this.clientName = name;
      this.toggleName = false;
      this.sendClientInfo();
    },
    getHint () {
      setInterval( () =>{
        // make it so it doesnt do the same hint twice in a row. also add transitions
        let r = Math.floor(Math.random() * 3);
        this.hint = this.hints[r];
      }, 10000);
    },
    openNameModal () {
      this.toggleName = true;
      this.$nextTick(() => this.$refs.changeNameInput.focus())
    }
  },
  created () {
    this.ws = new WebSocket(this.HOST);

    let r = Math.floor(Math.random() * this.images.length);
    this.profileImage = `images/0${r}.png`;
    this.togglePic = false;

    this.hint = this.getHint();

    // ws stuff
    this.ws.onopen = () => { 
      console.log('WebSocket connection is open...');
    };
    this.ws.onmessage = (e) => { 
      const json = JSON.parse(e.data);

      switch (json.type) {
        case 'client':
          this.clientInfo = json;
          break;
        case 'members':
          this.members = json.list;
          break;
        case 'messages':
          this.chatMessages = json.list;
          this.$nextTick(() => this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight)
          break;
        case 'message':
          this.chatMessages.push(json);
          if (this.chatMessages.length > 20) this.chatMessages.shift();

          this.$nextTick(() => this.$refs.chat.scrollTop = this.$refs.chat.scrollHeight)
          break;
        default:
          break;
      }
    };

    this.ws.onclose = () => { 
      console.error('WebSocket has disconnected');
      this.disconnected = true;
      this.toggleModal = false;
    };

    this.ws.onerror = (error) => console.error(error);
  },
  mounted () {
    this.$refs.newNameInput.focus();
  }
})

