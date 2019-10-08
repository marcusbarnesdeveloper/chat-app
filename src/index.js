const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', socket => {
  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return cb(error);
    }

    socket.join(user.room);
    socket.emit('welcome', generateMessage('Admin Welcome'));
    socket.broadcast
      .to(user.room)
      .emit('welcome', generateMessage(`${user.username} has joined`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    });
    cb();
  });

  socket.on('message', (msg, cb) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return cb('Profanity is bad');
    }
    io.to(user.room).emit('welcome', generateMessage(user.username, msg));
    cb();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'welcome',
        generateMessage(`${user.username} has headed out`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      });
    }
  });
  socket.on('sendLocation', (msg, cb) => {
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocation(
        user.username,
        `https://google.com/maps?q=${msg.lat},${msg.long}`
      )
    );
    cb('Location Shared');
  });
});

server.listen(port, () => {
  console.log('Server up on port: ' + port);
});
