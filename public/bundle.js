(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
/**
 * Constructor
 */
class ChatBot {
  constructor () {
    this.btnSendMessage = document.querySelector('.btn--send-message');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.form-control');
    this.inputSendUser = document.querySelector('.input--send-user');
    this.inputUser = document.querySelector('#u');
    this.elMsgContent = document.querySelector('.container1');
    this.elZoneChat = document.querySelector('#elZoneChat');


    // appel du constructeur par defaut de io
    this.socket = io();

    this.init();
  }

  init () {
    document.querySelector('.container').style.visibility = 'hidden';

    this.socket.on('messageytb', data => {
      // reception du pseudo avec les id de la videos souhaité
      console.log(data);
      var url = data.message;
      for (let i = 0; i < url.length; i++) {
        this.iframeYtb(url[i]);
      }
     });

    this.socket.on('messagecarfr', data => {
      console.log(data);
      this.insereMessage(data.pseudo, data.message + ' à demandé carrefour');
    });

    this.socket.on('messageubr', data => {
      console.log(data);
      this.insereMessage(data.pseudo, data.message + ' à demandé uber');
    });


    // reception d'un message
    this.socket.on('message', data => {
      console.log(data);
      this.insereMessage(data.pseudo, data.message);

      // choix options API
      if(data.message == '/') {
      } 
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

      if (key === 13) {

        if (this.inputSendMessage.value == "/youtube") {
            this.socket.emit('messageytb', this.inputSendMessage.value);
            this.inputSendMessage.value = '';
          } else if (this.inputSendMessage.value == "/carrefour") {
            this.socket.emit('messagecarfr', this.inputSendMessage.value);
            this.inputSendMessage.value = '';
          } else if (this.inputSendMessage.value == "/uber") {
            this.socket.emit('messageubr', this.inputSendMessage.value);
            this.inputSendMessage.value = '';
          } else {
            this.socket.emit('message', this.inputSendMessage.value);
            this.inputSendMessage.value = '';
        }
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

   iframeYtb (id) {

    const elNewIframe = document.createElement('iframe');
      elNewIframe.setAttribute("id", "player");
      elNewIframe.setAttribute("type", "text/html");
      elNewIframe.setAttribute("width", "640");
      elNewIframe.setAttribute("height", "360");
      elNewIframe.setAttribute("src", `http://www.youtube.com/embed/${id}`);

      elZoneChat.appendChild(elNewIframe);
  }

}

const chatBot = new ChatBot();

chatBot.run();

},{}]},{},[1]);
