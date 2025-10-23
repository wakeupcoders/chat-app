const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

const users = {}; // username -> socket.id

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    users[username] = socket.id;
    console.log(`${username} joined`);
    io.emit("user list", Object.keys(users));
    socket.broadcast.emit("chat message", {
      system: true,
      text: `${username} joined the group`,
    });
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit("user list", Object.keys(users));
      socket.broadcast.emit("chat message", {
        system: true,
        text: `${socket.username} left the chat`,
      });
    }
  });

  // Handle group messages
  socket.on("group message", (msg) => {
    io.emit("chat message", {
      username: socket.username,
      text: msg,
      to: "group",
    });
  });

  // Handle private messages
  socket.on("private message", ({ to, text }) => {
    const targetSocketId = users[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("private message", {
        from: socket.username,
        text,
      });
      // echo message to sender’s own chat
      socket.emit("private message", {
        from: socket.username,
        text,
        self: true,
        to,
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`listening on *:${PORT}`));
