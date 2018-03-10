const express = require('express');
const app = express();
const request = require('request');
const googleTranslate = require('google-translate')('AIzaSyA9sNGTf3gzoXsl0a0KKdtlmXvF_IgymtM');
const NodeGeocoder = require('node-geocoder');
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

  // ----------------- API UBER -----------------
  socket.on('messageubr', message => {
    io.emit('messageubr', {'pseudo': socket.pseudo, 'message': message});
  });

  const callApiUber = (longitude, latitude) => {
    var options = {
      "method": 'GET',
      "url": 'https://api.uber.com/v1.2/estimates/price',
      "qs": {
        "start_latitude": latitude,
        "start_longitude": longitude,
        "end_latitude": '48.8584',
        "end_longitude": '2.2945'
      },
      "headers": {
        'Authorization': 'Token ' + 'GiXTv8BW2O-18gX4iNfVmzEkNm1Khmxo-ALAhVGH',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json'
      }
    };

    request(options, function (error, response, body) {
      if (error) return  console.error('Failed: %s', error.message);
     
        let jsonPrice = JSON.parse(body); 

        io.emit('uberPrice', {'pseudo': socket.pseudo, 'message': jsonPrice});
      
    });
  };

  socket.on('positionApiUber', message => {
    io.emit('uberGPS', {'message': message});
  });

  // ----------------- API Geocoding -----------------

  const callApiGeocoder = (longitude, latitude, callback) => {
    var options = {
      "provider": 'google',

      // Optional depending on the providers
      "httpAdapter": 'https', // Default
      "apiKey": 'AIzaSyDr3efeLW5rtT6b-o66D9qJoxeoSt1TxYQ', // for Mapquest, OpenCage, Google Premier
      "formatter": null // 'gpx', 'string', ...
    };

    var geocoder = NodeGeocoder(options);

    geocoder.reverse({"lat": latitude, "lon": longitude}, function (err, res) {
      var posDest = [];

      var uberPosition = res[0].city;
      posDest.push(uberPosition);

      callback(posDest);
    });
  };

  /*socket.on('uberdestination', message => {
    console.log('--------------->   DESTINATION:');
    console.log(message);
    io.emit('uberposition', {'message': message});
  });*/

  socket.on('positionApiGeo', message => {
    callApiGeocoder(message[0].longitude, message[0].latitude, res => {
      io.emit('uberposition', {'message': res[0]});
    });
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
    } 
      let resp = body;

      io.emit('positionJson', {'pseudo': socket.pseudo, 'message': resp});
    
  });
  };

  socket.on('position', message => {
    callApiCarrefour(message[0].longitude, message[0].latitude);
  });
});

server.listen(8081);
