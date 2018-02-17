class ChatBot {
  constructor () {
    this.btnSendMessage = document.querySelector('.btn--send-message');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.form-control');
    this.inputSendUser = document.querySelector('.input--send-user');
    this.inputUser = document.querySelector('#u');
    this.elMsgContent = document.querySelector('.container1');

    // appel du constructeur par defaut de io
    this.socket = io();
  }

  init () {
    document.querySelector('.container').style.visibility = 'hidden';

    // reception d'un message
    this.socket.on('message', data => {
      this.insereMessage(data.pseudo, data.message);
    });

    // reception d'un client
    this.socket.on('nouveau_client', data => {
      this.displayUserChat(data);
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
    this.inputSendMessage.addEventListener('keypress', e => {
      let key = e.which || e.keyCode;

      console.log('test');
      if (key === 13) {
        console.log(this.inputSendMessage.value);
        // Affiche le message aussi sur
        this.socket.emit('message', this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
    });
  }

  /**
   * Send Value from input say - Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
   *
   * @return {Chat}
   */
  addUser () {
    this.inputSendUser.addEventListener('click', e => {
      if (this.inputUser.value === '') {
        document.write('Vous devez obligatoirement choisir un pseudo <a href="index.html">revenir à la page</a>');
      } else {
        e.preventDefault();
        document.querySelector('.container').style.visibility = '';
        this.pseudo = document.querySelector('#login input').value;
        document.querySelector('#login').style.visibility = 'hidden';
        this.socket.emit('nouveau_client', this.pseudo);
      }
    });
  }

  /**
    * Display user on chat
    *
    * @param {String} message
    * @return {String} dom
    */
  displayUserChat (pseudo) {
    let dom = '';

    dom += '<div class="row message-bubble">';
    dom += '<p class="text-muted">' + pseudo + ' vient de se connecter au chat' + '</p>';
    dom += '</div>';

    this.elMsgContent.innerHTML += dom;
  }

  /**
    * Insert message into chat
    *
    * @param {String} message
    * @return {String} dom
    */
  insereMessage (pseudo, message) {
    let dom = '';

    dom += '<div class="row message-bubble">';
    dom += '<p class="text-muted">' + pseudo + '</p>';
    dom += '<span>' + message + '</span>';
    dom += '</div>';

    this.elMsgContent.innerHTML += dom;
  }
}

const chatBot = new ChatBot();

chatBot.run();
