const express = require('express');
const app = express();
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
    // envoie a toute les socket clientes qui sont connectés
    io.emit('message', {'pseudo': socket.pseudo, 'message': message});
  });


// ----------------- APIS ----------------- 
  socket.on('messageubr', message => {
    io.emit('messageubr', {'pseudo': socket.pseudo, 'message': message});
  });

  socket.on('messagecarfr', message => {
    io.emit('messagecarfr', {'pseudo': socket.pseudo, 'message': message});
  });

// ----------------- API Youtube ----------------- 

  socket.on('titrevideo', message => {
    callApi(message, result => {});
  });

  const callApi = (name, callback) => {
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
        callback(tabVideos);
      }
    });
    return;
  };

  socket.on('messageytb', message => {
    io.emit('messageytb', {'pseudo': socket.pseudo, 'message': message});
  });

});

server.listen(8081);
