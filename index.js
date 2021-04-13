const express = require('express');
let db = require('./mockdata');
const app = express();
const port = 4000;
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

//until we get uuid or something going, will just count up on each server reset
let userid = 2;
let messageid = 2;
let public_channelid = 2;
let private_channelid = 1;

app.use(express.json());

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  next();
});

io.on('connect', (socket) => {
  console.log(`Connection made to new client ${socket.id}`);

  socket.on('test', () => {
    console.log('Hello World')
  });

  /* USERS */
  socket.on('get-users', () => {
    if (db.users.length === 0) document.write("Couldn't find any users");
    io.emit('get-users', db.users);
  });

  socket.on('new-user', (user) => {
    userid++;

    db.users.push(user);
    io.broadcast.emit('new-user', db.users); // Since we are changing the database, the updated database must be broadcast to all clients so the can update their state
  });

  socket.on('delete-user', (userid) => {
    let doesExist = db.users.find(user => user.id === userid);
    if (!doesExist) console.log('User could not be deleted because it was not found');
  
    db.users = db.users.filter(user => !(user.id === userid));
    io.broadcast.emit('delete-user', db.users) // Again, we are altering the database, so all clients must be aware of the changes
  });

  socket.on('update-user', (userid) => {
    let updatedUserIndex = db.users.findIndex(user => user.id === userid);
    if (updatedUserIndex === -1) console.log('User could not be updated because it was not found');
  
    //TODO: make it work better
  
    // db.users[updatedUserIndex] = {
    //   ...db.users[updatedUserIndex],
    //   ...req.body,
    // }
  
    db.users[updatedUserIndex] = {
      id: foundUser.id,
      username: req.body.username || foundUser.username,
      password: req.body.password || foundUser.password,
      createdAt: foundUser.createdAt,
      updatedAt: Date.now(),
      profile: foundUser.profile || {
        age: req.body.age || foundUser.age,
        birthday: 
          req.body.birthday ?
          new Date(req.body.birthday)
          : foundUser.birthday,
        location: req.body.location || foundUser.location,
        about: req.body.about || foundUser.about,
      },
      friends: foundUser.friends,
      private_channels: foundUser.private_channels,
      public_channels: foundUser.public_channels
    }
  
    io.broadcast.emit(db.users);
  });

  socket.on('add-friend', (params) => {
    let updatedUserIndex = db.users.findIndex(user => user.id === params.userId);
    if (updatedUserIndex === -1) console.log('User could not be updated because it was not found');
    
    //TODO: make it work better
    
    // db.users[updatedUserIndex] = {
    //   ...db.users[updatedUserIndex],
    //   ...req.body,
    // }
    
    let foundFriend = db.users.find(user => user.id === params.friendId);
    if (!(foundFriend)) console.log('User could not be friended because it was not found');
    
    if (!db.users[updatedUserIndex].friends.includes(foundFriend.id)) {
      db.users[updatedUserIndex].friends.push(foundFriend.id);
      io.broadcast.emit(db.users); // Let all clients know
    } else console.log('User already friended');
  });

  socket.on('join-channel', (name) => {
    console.log(`Join channel: ${name}`)
    socket.join(name)
    requestedChannel = db.channels.find((channel) => channel.name === name)
    io.to(name).emit('get-messages', requestedChannel.messages)
  });

  socket.on('leave-channel', (channel) => {
    console.log(`Leave channel: ${channel}`)
    socket.leave(channel)
  });

  socket.on('new-message', (params) => {
    requestedChannel = db.channels.find((channel) => channel.name === params.name)
    requestedChannel.messages.push(params.message)
    io.to(params.name).emit('new-message', params.message)
  });


  // socket.on('disconnect', (socket) => {
  //   console.log('Connection lost')
  //   socket.removeAllListeners();
  // })
});













// /* PUBLIC CHANNELS */

// app.get('/channels/public/', (req, res) => {
//   if (db.public_channels === 0) res.status(404).send("Couldn't find any channels");
//   res.status(200).json(db.public_channels);
// });

// /* PRIVATE CHANNELS */

// app.get('/channels/private/', (req, res) => {
//   if (db.private_channels === 0) res.status(404).send("Couldn't find any channels");
//   res.status(200).json(db.private_channels);
// });

// app.get('/channel/private/:id', (req, res) => {
//   let foundChannel = db.private_channels.find((channel) => channel.id === req.params.id)
//   if (!foundChannel) res.status(404).send(`Couldn't find channel ${req.params.id}`);
//   res.status(200).json(foundChannel);
// });

// app.post('/channel/private?adduser', (req, res) => {
//   if (!req.body.name) res.status(400).send("No name found in body")
//   if (req.query.adduser) {
//     let foundChannel = db.private_channels.find((channel) => channel.id === req.params.id)
//     foundChannel.users.push(req.query.adduser)
//     res.status(200).json(foundChannel)
//   } else {
//     res.status(200).json(db.private_channels)
//   }
// });

// app.post('/channel/private?adduser', (req, res) => {
//   if (!req.body.name) res.status(400).send("No name found in body")
//   res.status(200).json(db.private_channels)
// });

// });

// /* MESSAGES */

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
