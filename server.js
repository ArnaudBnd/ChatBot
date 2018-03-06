const express = require('express');
const app = express();
const request = require('request');
const googleTranslate = require('google-translate')('AIzaSyA9sNGTf3gzoXsl0a0KKdtlmXvF_IgymtM');
let YouTube = require('youtube-node');
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

app.use ('/', express.static(`${__dirname}/public`));

io.sockets.on('connection', socket => {
  console.log('un utilisateur vient de se connecter');

  // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
  socket.on('nouveau_client', pseudo => {
    socket.pseudo = pseudo;
    socket.broadcast.emit('nouveau_client', pseudo);
  });

  // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
  socket.on('message', message => {
    message = ent.encode(message);
    io.emit('message', {'pseudo': socket.pseudo, 'message': message});
  });

  // ----------------- APIS -----------------
  socket.on('messageubr', message => {
    io.emit('messageubr', {'pseudo': socket.pseudo, 'message': message});
  });

  // ----------------- API Translate (en, es, de) -----------------

  socket.on('messagetranslt', message => {
    io.emit('messagetranslt', {'pseudo': socket.pseudo, 'message': message});
  });

  const callApiTranslate = text => {
    var textTranslate = [];
    var langage = ['en', 'es', 'de'];

    for (var i = 0; i < langage.length; i ++) {
      googleTranslate.translate(text, langage[i], (err, translation) => {
        if (err) {
          console.log('err');
        } else {
          var text1 = translation.translatedText;

          textTranslate.push(text1);
          console.log(textTranslate);
          io.emit('texttranslate', {'pseudo': socket.pseudo, 'message': textTranslate});
        }
      });
    }
  };

  socket.on('sentence', message => {
    callApiTranslate(message);
  });

  // ----------------- API Youtube -----------------

  socket.on('messageytb', message => {
    io.emit('messageytb', {'pseudo': socket.pseudo, 'message': message});
  });

  const callApiYoutube = name => {
    const tabVideos = [];
    let youTube = new YouTube();

    youTube.setKey('AIzaSyBHUsxQvMVXD95PK5ewUz6xw7ZCes2QnIk');

    youTube.search(name, 5, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        for (let i = 0; i < 5; i ++) {
          tabVideos.push(result.items[i].id.videoId);
        }
        io.emit('titrevideo', {'pseudo': socket.pseudo, 'message': tabVideos});
      }
    });
    return;
  };

  socket.on('titrevideo', message => {
    callApiYoutube(message);
  });

  // ----------------- API Carrefour -----------------

  socket.on('messagecarfr', message => {
    io.emit('messagecarfr', {'pseudo': socket.pseudo, 'message': message});
  });

const callApiCarrefour = (longitude, latitude) => { 
  const options = {'method': 'GET',
    'url': 'https://api.fr.carrefour.io/v1/openapi/stores',
    'qs':
     {'longitude': longitude,
       'latitude': latitude,
       'radius': '10000',
       'format': 'PRX'
     },
    'headers':
     {'accept': 'application/json',
       'x-ibm-client-secret': 'C1yD0eY7sT2yL8sJ4yR4tX5fW7eP7tV1dC6qA7fX4aU1gQ8oX8',
       'x-ibm-client-id': '98cc4890-9c5b-4a9c-b2d9-3c9fdf7c4c18'
     }
  };

  request(options, function (error, response, body) {
    if (error) {
      return console.error('Failed: %s', error.message);
    } else {
      let response = body;

      io.emit('positionJson', {'pseudo': socket.pseudo, 'message': response});
    }
  });
}

  socket.on('position', message => {
    callApiCarrefour(message[0].longitude, message[0].latitude);
  });


});

server.listen(8081);
