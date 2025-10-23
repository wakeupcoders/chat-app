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
  socket.on('join', (username) => {
    socket.username = username;
    socket.broadcast.emit('chat message', { system: true, text: `${username} joined the chat` });
  });

  socket.on('chat message', (msg) => {
    const username = socket.username || 'Anonymous';
    io.emit('chat message', { username, text: msg });
  });

  socket.on('disconnect', () => {
    const username = socket.username;
    if (username) {
      socket.broadcast.emit('chat message', { system: true, text: `${username} left the chat` });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on *:${PORT}`));
