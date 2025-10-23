const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  // listen for the "join" event where the client sends the username
  socket.on('join', (username) => {
    socket.username = username;               // store username on socket
    // broadcast to all **others** that this user has joined
    socket.broadcast.emit('chat message', `${username} has joined the chat`);
    console.log(`${username} joined`);
  });

  // listen for chat messages
  socket.on('chat message', (msg) => {
    const username = socket.username || 'Anonymous';
    // send to all including sender
    io.emit('chat message', `${username}: ${msg}`);
    console.log(`${username}: ${msg}`);
  });

  socket.on('disconnect', () => {
    const username = socket.username || 'Someone';
    // broadcast to others
    socket.broadcast.emit('chat message', `${username} has left the chat`);
    console.log('user disconnected', socket.id, username);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
