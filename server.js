const express = require('express');
const app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

app.use ('/', express.static(`${__dirname}/public`));

io.sockets.on('connection', socket => {
  console.log('un utilisateur vient de se connecter');

  // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
  socket.on('nouveau_client', pseudo => {
    console.log(pseudo);
    socket.pseudo = pseudo;
    socket.broadcast.emit('nouveau_client', pseudo);
  });

  // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
  socket.on('message', message => {
    message = ent.encode(message);
    console.log(message);
    // envoie a toute les socket clientes qui sont connectés
    io.emit('message', {'pseudo': socket.pseudo, 'message': message});
  });
});

server.listen(8081);
