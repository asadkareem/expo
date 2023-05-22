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

process.on('SIGTERM', () => {
  console.log('sigterm received shutting down gracefully');
  server.close(() => {
    console.log(' 💥 process terminated');
  });
});

const io = require('socket.io')(server, {
  pingTimeOut: 60000,
  cors: {
    origin: 'http://localhost:3000',
  },
});

io.on('connection', (socket) => {
  console.log('a user connected');
  //setup will take the user data from the frontend
  //we are creating a new socket where frontend will send the data
  //will join our room
  socket.on('setup', (userData) => {
    //we will create a new room with the id of the new user data
    //that room will be exclusive to that user only
    socket.join(userData._id);
    console.log(userData);
  });
  socket.emit('connectionEstablish');
  //this will take the room id from the frontend
  //when we will click on the chat this will creat the room with the particular user
  //when the other user will join it will add to this particular room
  //this will be the id of the selected chat we will create a new room
  //or the id of the particular chat
  //from the frontend user will click on the chat id will be
  socket.on('join chat', (roomId) => {
    socket.join(roomId);
    console.log(
      'user went to frontend when he click on the chat at that time he sent the chat id by that he joined the chat room ' +
        roomId
    );
  });

  //lets make the send message functionality in the backend
  //we have to manage the messages from here and we have to send them to the rooms
  socket.on('new message', (newMessageReceived) => {
    //we will check the message to which chat it belong to
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      console.log('users not defined on the chat');
    }
    //if we are the user and we are sending the message inside a group we want to send to everyone exxpect from us
    //so there are five people in the room and i am sending the chat to the it should be received to the other particeptents not me
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      //inside the user room that we created here on the top
      //for that particular user we send the message received with that particualr message
      socket.in(user._id).emit('message received', newMessageReceived);
    });
  });
});
