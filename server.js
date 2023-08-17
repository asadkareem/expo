const mongoose = require('mongoose');
const app = require('./app');
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

//all of the roomsId are seletd chatId

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
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');
  //room for that particualr user 
  //socket.emit("setup",user) from the front-end
  socket.on('setup', (id) => {
    socket.join(id);
    console.log('user connect with this id:', id);
    socket.emit('connected');
  });
  //this will take the room id from the front-end 
  //so when we click on the chat it will create the room with the user and the other particular user 
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });



  socket.on('new message', (newMessageRecieved) => {
    if (newMessageRecieved.image) {
      delete newMessageRecieved.content;
    }
    console.log("new message got hit")
    console.log(newMessageRecieved);
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      io.to(user._id).emit('message recieved', newMessageRecieved);
    });
  });




  socket.on('new picture', (newChatImageRecieved) => {
    var chat = newChatImageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');
    chat.users.forEach((user) => {
      if (user._id == newChatImageRecieved.sender._id) return;
      io.to(user._id).emit('picture recieved', newChatImageRecieved);
    });
  });

  socket.off('setup', () => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});


//how to send a message in a room 
