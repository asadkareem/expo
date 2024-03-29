const mongoose = require('mongoose');
const app = require('./app');
const { deleteMany } = require('./models/messageModel');
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
//connecting to the database
const DB = process.env.DATABASE_CLOUD;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => {
    console.log('DB connection successful');
  });

//starting the server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});


process.on('SIGTERM', () => {
  console.log('sigterm received shutting down gracefully');
  server.close(() => {
    console.log(' 💥 process terminated');
  });
});

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
  pingTimeout: 60000
});

var clients = {

}
io.on('connection', (socket) => {
  const numberOfProperties = Object.keys(clients).length
  console.log("*****************************************")
  console.log(numberOfProperties)

  socket.on('setup', (id) => {
    if (clients[id]) {
      delete clients[id];
    }
    socket.data.userId = id;
    clients[id] = socket;
    const numberOfProperties = Object.keys(clients).length
    console.log(numberOfProperties)
    console.log(clients)
    socket.emit('connected', id);
  });

  socket.on('new message', (newMessage) => {
    const newMessageRecieved = newMessage.message
    if (newMessageRecieved?.image) {
      delete newMessageRecieved.content;
    }
    console.log("new message got hit")
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      if (clients[user._id]) {
        clients[user._id].emit('message recieved', newMessageRecieved);
      }
    });
  });

  socket.on('new picture', (newChatImageRecieved) => {
    var chat = newChatImageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id == newChatImageRecieved.sender._id) return;
      if (clients[user._id]) {
        console.log(clients[user._id])
        clients[user._id].emit('message recieved', newMessageRecieved);
      }
    });
  });

  // socket.on('disconnect', (id) => {
  //   delete clients[id]
  //   console.log(`Client disconnected: ${socket.id}`);
  // });
})



