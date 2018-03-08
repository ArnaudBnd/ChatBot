(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
/**
 * Constructor
 */
class ChatBot {
  constructor () {
    this.btnSendMessage = document.querySelector('.btn--send-message');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.form-control');
    this.inputSendTitre = document.querySelector('.input-group1 input');
    this.inputSendUser = document.querySelector('.input--send-user');
    this.inputUser = document.querySelector('#u');
    this.elMsgContent = document.querySelector('.container1');
    this.elNewTitle = document.querySelector('#elZoneChat1');
    this.elZoneChat = document.querySelector('#elZoneChat');

    // appel du constructeur par defaut de io
    this.socket = io();

    this.init();
  }

  init () {
    document.querySelector('.container').style.visibility = 'hidden';

    // ------------------------- Message youtube -------------------------
    this.socket.on('messageytb', data => {
      this.insereMessage(data.pseudo + ' à demandé youtube.', data.message = '');
      this.insereMessage(data.pseudo, data.message = '' + ' Veuillez rechercher un titre de video à afficher: ');

      this.sendTitreVideo();
    });

    this.socket.on('titrevideo', data => {
      console.log(data);
      var url = data.message;

      for (let i = 0; i < url.length; i ++) {
        this.iframeYtb(url[i]);
      }
    });

    // ------------------------- Message translate -------------------------
    this.socket.on('messagetranslt', data => {
      this.insereMessage(data.pseudo + ' à demandé translate.', data.message = '');
      this.insereMessage(data.pseudo, data.message = '' + ' Veuillez choisir une phrase a traduire: ');

      this.sendSentence();
    });

    this.socket.on('texttranslate', data => {
      if (data.message.length === 3) {
        this.insereMessage(data.pseudo = '' + 'Voici la traduction:', data.message);
      }
    });

    // ------------------------- Message carrefour -------------------------
    this.socket.on('messagecarfr', data => {
      this.insereMessage(data.pseudo + ' à demandé carrefour.', data.message = '');
      this.insereMessage(data.pseudo, data.message = '' + ' Voici une listes des stores dans voter localité actuelle');
      //fonction qui recup la longitude et lattitude de l'utilisateur

      this.getLongLatCar();
    });

    this.socket.on('positionJson', data => {
      let list = JSON.parse(data.message).list;

      for (let item of list) {
        this.iframeCarrefour(item.address);
      }
    });

    // ------------------------- Message uber -------------------------
    this.socket.on('messageubr', data => {
      this.insereMessage(data.pseudo, data.message + ' à demandé uber');

      this.getLongLatUber();
    });

    this.socket.on('uberPrice', data => {
      console.log('-----------------> data Uber Price: ');
      console.log(data);
    });

    // TODO parser les coordonnées gps pour les passer en parametre de iframe()
    this.socket.on('uberGPS', data => {
      console.log('-----------------> data Uber GPS: ');
      console.log(data.message[0].latitude);

      //this.iframeUber(position, destination);
    });
    

    // ------------------------- Message chat -------------------------
    this.socket.on('message', data => {
      this.insereMessage(data.pseudo, data.message);
    });

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
        if (this.inputSendMessage.value === '/youtube') {
          this.socket.emit('messageytb', this.inputSendMessage.value);
          this.inputSendMessage.value = '';
          document.querySelector('.input-group1').style.visibility = '';
          document.querySelector('.input-group').style.visibility = 'hidden';
        } else if (this.inputSendMessage.value === '/translate') {
          this.socket.emit('messagetranslt', this.inputSendMessage.value);
          this.inputSendMessage.value = '';
          document.querySelector('.input-group1').style.visibility = '';
          document.querySelector('.input-group').style.visibility = 'hidden';
        } else if (this.inputSendMessage.value === '/carrefour') {
          this.socket.emit('messagecarfr', this.inputSendMessage.value);
          this.inputSendMessage.value = '';
        } else if (this.inputSendMessage.value === '/uber') {
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
   * Send titre for video youtube
   *
   * @return {Chat}
   */
  sendTitreVideo () {
    this.inputSendTitre.addEventListener('keypress', e => {
      let key = e.which || e.keyCode;

      if (key === 13) {
        this.socket.emit('titrevideo', this.inputSendTitre.value);
        this.inputSendTitre.value = '';
      }
    });
  }

  /**
   * Send Sentence to translate
   *
   * @return {Chat}
   */
  sendSentence () {
    this.inputSendTitre.addEventListener('keypress', e => {
      let key = e.which || e.keyCode;

      if (key === 13) {
        this.socket.emit('sentence', this.inputSendTitre.value);
        this.inputSendTitre.value = '';
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
        document.querySelector('.input-group1').style.visibility = 'hidden';
        this.pseudo = document.querySelector('#login input').value;
        document.querySelector('#login').style.visibility = 'hidden';
        this.socket.emit('nouveau_client', this.pseudo);
      }
    });
  }

  /**
    * Display user on chat
    *
    * @param {String} pseudo
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

  /**
    * Create iframe youtube
    *
    * @param {int} id
    * @return {String} dom
    */
  iframeYtb (id) {
    const elNewIframe = document.createElement('iframe');

    elNewIframe.setAttribute('id', 'player');
    elNewIframe.setAttribute('type', 'text/html');
    elNewIframe.setAttribute('width', '640');
    elNewIframe.setAttribute('height', '360');
    elNewIframe.setAttribute('src', `http://www.youtube.com/embed/${id}`);

    this.elZoneChat.appendChild(elNewIframe);
  }

  /**
    * Create iframe carrefour google map
    *
    * @param {int} position
    * @return {String} dom
    */
  iframeCarrefour (position) {
    const elNewIframe = document.createElement('iframe');

    elNewIframe.setAttribute('width', '600');
    elNewIframe.setAttribute('height', '450');
    elNewIframe.setAttribute('frameborder', '0');
    elNewIframe.setAttribute('style', 'border:0');
    elNewIframe.setAttribute('src',
      `https://www.google.com/maps/embed/v1/place?key=AIzaSyBzhXQGlpp20V71dGCT_67REdUlWe-Gpog&q=${position}`);

    this.elZoneChat.appendChild(elNewIframe);
  }

    /**
    * Create iframe uber google map
    *
    * @param {int} position, destination
    * @return {String} dom
    */
  iframeUber (position, destination) {
    const elNewIframe = document.createElement('iframe');

    elNewIframe.setAttribute('width', '600');
    elNewIframe.setAttribute('height', '450');
    elNewIframe.setAttribute('frameborder', '0');
    elNewIframe.setAttribute('style', 'border:0');
    elNewIframe.setAttribute('src',
      `https://www.google.com/maps/embed/v1/directions
       ?key=AIzaSyBzhXQGlpp20V71dGCT_67REdUlWe-Gpog
       &origin=${position}
       &destination=${destination}
       &avoid=tolls|highways`);

    this.elZoneChat.appendChild(elNewIframe);
  }

  /**
    * Get position from users
    *
    * @param {int} id
    * @return {String} dom
    */
  getLongLatCar () {
    var ioo = this.socket;

    function getLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
    }

    function showPosition (position) {
      let latLong = [];

      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;

      latLong.push({'latitude': latitude, 'longitude': longitude});

      console.log(latLong);
      ioo.emit('position', latLong);
    }

    getLocation();
  }

  /**
    * Get position from users
    *
    * @param {int} id
    * @return {String} dom
    */
  getLongLatUber () {
    var ioo = this.socket;

    function getLocation () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
      } else {
        console.log('Geolocation is not supported by this browser.');
      }
    }

    function showPosition (position) {
      let latLong = [];

      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;

      latLong.push({'latitude': latitude, 'longitude': longitude});

      console.log(latLong);
      ioo.emit('positionUber', latLong);
    }

    getLocation();
  }


}

const chatBot = new ChatBot();

chatBot.run();

},{}]},{},[1]);
