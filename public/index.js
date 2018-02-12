class ChatBot {
  constructor () {
    this.btnSendMessage = document.querySelector('.btn--send-message');
    //this.io = require('socket.io-client');
    //this.socket = this.io.connect('http://localhost:8081');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
    this.socket = io();
  }

  init () {
    alert('Serveur succes');
    document.querySelector('#zone_chat').style.visibility = 'hidden';

    this.socket.on('message', data => {
    this.insereMessage(data.pseudo, data.message);
    });
    this.addUser();
  }

  /**
   * Run
   * @return {Chat}
   */
  run () {
    this.init();
    this.sendMessage();
  }

  /**
   * Send Value from input say - Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
   *
   * @return {Chat}
   */
  sendMessage () {
    // event click keypress
    this.inputSendMessage.addEventListener('keypress', (e) => {
      var key = e.which || e.keyCode;
      console.log("test");
      if (key === 13) {
        // Affiche le message aussi sur
        this.socket.emit('nouveau_client', this.pseudo);
        this.socket.emit('message', this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
    });
  }

  addUser () {
    const sendUser = document.querySelector('#log');

    this.inputSendMessage.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("test1");
      this.pseudo = document.querySelector('#login input').value;
      document.querySelector('#zone_chat').style.visibility = '';
      document.querySelector('#login').style.visibility = 'hidden';
    });
  }

  /**
   * inserer le message dans le chat
   *
   * @return {Chat}
   */
  insereMessage (pseudo, message) {
    const p = document.createElement('p');

    p.textContent = pseudo + ' : ' + message;
    this.zoneChat.prepend(p);
    return false;
  }
}

const chatBot = new ChatBot();

chatBot.run();
