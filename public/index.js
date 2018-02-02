class ChatBot {
  constructor () {
    this.btnSendMessage = document.querySelector('.btn--send-message');
    this.io = require('socket.io-client');
    this.socket = this.io.connect('http://localhost:8081');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
  }

  init () {
    alert('Serveur succes');
    this.pseudo = prompt('Quel est votre pseudo ?');
    this.socket.on('message', (data) => {
      this.insereMessage('', data.message);
    });
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
    // event click buttom
    this.btnSendMessage.addEventListener('click', () => {
      this.insereMessage(this.pseudo, this.inputSendMessage.value);
      this.inputSendMessage.value = '';
    });

    // event click keypress
    this.inputSendMessage.addEventListener('keypress', (e) => {
      var key = e.which || e.keyCode;

      if (key === 13) {
        // Affiche le message aussi sur
        this.insereMessage(this.pseudo, this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
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
    this.zoneChat.appendChild(p);
    document.title = pseudo + ' - ' + document.title;
  }
}

const chatBot = new ChatBot();

chatBot.run();
