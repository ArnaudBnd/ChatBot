const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)

// Chargement de la page index.html
app.get('/', (req, res) => {
  res.sendfile(`${__dirname}/index.html`);
});

//app.use ('/', express.static(path.join(`${__dirname}/index.html`)));

io.sockets.on('connection', socket => {

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
});

server.listen(8081);
