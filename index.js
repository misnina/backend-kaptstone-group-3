const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: 'https://dry-spire-38380.herokuapp.com/',
    allowedHeaders: [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods",
    ],
    credentials: true,
  }
});
const mongoose = require('mongoose');
const cors = require('cors');

//app.use(cors());
app.options('*', cors());
app.use(express.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.header("Access-Control-Allow-Origin", `https://dry-spire-38380.herokuapp.com`);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Max-Age', 120);
    return res.status(200).json({});
  }

  next();
});


mongoose.connect(`mongodb+srv://kenzie:group3@squirl.wtd5c.mongodb.net/Squirl?retryWrites=true&w=majority` || url, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
const Schema = mongoose.Schema;




/* DATABASE SCHEMAS */

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is requried']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  createdAt: {
    type: Date, default: Date.now()
  },
  updatedAt: {
    type: Date, default: Date.now()
  },
  profile: {
    age: {
      type: Number, default: null
    },
    birthday: {
      type: Date, default: null
    },
    location: {
      type: String, defult: null
    },
    about: {
      type: String, default: null
    },
  },
  friends: [
    {type: Schema.Types.ObjectId, ref: 'User'}
  ]
});
const User = mongoose.model('User', userSchema);


const messageSchema = new mongoose.Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: Date,
  updatedAt: Date,
  text: {
    type: String,
    required: true
  },
});
const Message = mongoose.model('Message', messageSchema);


const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  messages: [
    {type: Schema.Types.ObjectId, ref: 'Message'}
  ]
})
const Channel = new mongoose.model('Channel', channelSchema);


const defaultChannels = ['general', 'books', 'gaming'];
//create the default channels if they don't exist yet
defaultChannels.map(channelName => {
  Channel.findOne({ 'name': channelName }, function (err, channel) {
    if (channel === null) {
      const newChannel = new Channel({
        name: channelName,
        displayName: channelName.charAt(0).toUpperCase() + channelName.slice(1),
      });
      newChannel.save();
  }})
});

app.get('/:channelName/messages', (req, res) => {
  const foundChannel = db.channels.find(channel => {
    return channel.name === req.params.channelName
  });
  if (!foundChannel) {
    res.status(404).send('Test');
  }
  res.json(foundChannel.messages);
});

const testUser = new User({
  username: 'BuddyDude',
  password: 'password',
});

User.findOne({ username: testUser.username }, (err, user) => {
  if (!user) testUser.save();
})

const findUserList = async () => {
  let foundUserList = [];
  await User.find({}, function (err, users) {
    if (err) return;
    foundUserList = users;
  });
  return foundUserList;
};


app.get('/user/:userid', async (req, res) => {
  let foundUser = "";
  foundUser = await User.findById(req.params.userid, (err, user) => {
    if (err) res.status(404).send('User could not be found');
    return user
  });

  if (foundUser) {
    res.status(200).send(foundUser);
    return;
  }
  res.status(404).send('User could not be found');
  return;
})

app.patch('/user/:userid', async (req, res) => {
  let foundUser = await User.findOne({ _id: req.params.userid });
  console.log(req.params.userid);
  console.log(req.body);
  const profileUpdate = {
    age: req.body.profile.age || foundUser.profile.age,
    birthday: req.body.profile.birthday || foundUser.profile.birthday,
    location: req.body.profile.location || foundUser.profile.location,
    about: req.body.profile.about || foundUser.profile.about,
  }

  foundUser.username = req.body.username || foundUser.username;
  foundUser.password = req.body.passowrd || foundUser.password
  foundUser.profile = profileUpdate;
  await foundUser.save((err, user) => {
    if (err) res.status(409).send('Could not save the user changes');
    res.status(200).send(user);
  });
});

app.post('/users', async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  await newUser.save((err, user) => {
    if (err) res.status(400).send('User could not be created');
    res.status(200).send(user);
  });
});

app.delete('/user/:userid', async (req, res) => {
  await User.deleteOne({ _id: req.params.userid }, (err) => {
    if (err) res.status(400).send('User could not be deleted');
    res.status(200).send('User deleted sucesffuly');
  })
});

/* SOCKETS */
/*
  We are using sockets to post messages to
  our front end.
*/

io.on('connect', (socket) => {
  console.log(`Connection made to new client ${socket.id}`);

  socket.on('login', async ({username, password}) => {
    await User.findOne({ username: username, password: password }, function (err, user) {
      if (err) {
        io.emit('toast-error', 'Could not login');
      } else {
        io.to(socket.id).emit('login', user);
      }
    });
  });

  socket.off('logout', () => {
    io.to(socket.id).emit('logout');
  });

  /* USERS */
  socket.on('get-users', async () => {
    await User.find({}, function (err, users) {
      if (err) io.emit('get-users', []);
      io.emit('get-users', users);
    })
  });

  socket.on('new-user', async (user) => {
    console.log(user);
    const newUser = new User({
      username: user.username,
      password: user.password,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await newUser.save((err, user) => {
      if (err) io.emit('toast-error', 'Could not create user');
      io.emit('new-user', user);
    });
  });

  socket.on('delete-user', async (user) => {
    await User.findOne({ username: username, password: password }, function (err, user) {
      if (err) {
        io.emit('toast-error', 'Could not find user to delete.');
      } else {
        User.deleteOne({ username: user.username }, function (err) {
          if (err) io.emit('toast-error', 'Could not delete user');
          io.broadcast.emit('delete-user', findUserList); // Again, we are altering the database, so all clients must be aware of the changes
        })
      }
    });
  });

  socket.on('add-friend', async (params) => {
    const foundUser = await User.findOne({ id: user.id });
    const foundFriend = await User.findOne({ id: friendId });

    if (!foundUser || !foundFriend ) {
      io.emit('toast-error', 'Could not complete friend request.');
      return;
    }
  
    foundUser.updateOne({ friends: [
      ...friends,
      foundFriend.id,
    ]});

    foundFriend.updateOne({ friends: [
      ...friends,
      foundUser.id,
    ]})

    io.boradcast.emit('add-friend', await findUserList);
  });

  socket.on('join-channel', async (channelName) => {
    console.log(`Join channel: ${channelName}`)
    socket.join(channelName);

    await Channel.findOne({ name: channelName}, function (err, channel) {
      if (err) {
        io.emit('toast-error', 'Could not find the proper channel in the database.');
        return;
      };
    }).populate('messages').exec((err, channel) => {
      io.to(channelName).emit('get-messages', channel.messages || []);
    });
  });

  socket.on('get-messages', async (channelName) => {
    await Channel.findOne({ name: channelName}, function (err) {
      if (err) {
        io.emit('toast-error', 'Could not find the proper channel in the database.');
        return;
      };
    }).populate('messages').exec((err, channel) => {
      io.to(channelName).emit('get-messages', channel.messages || []);
    });
  })

  socket.on('leave-channel', (channel) => {
    console.log(`Leave channel: ${channel}`)
    socket.leave(channel)
  });

  socket.on('new-message', async (params) => {
    await Channel.findOne({ name: params.channelName}, function (err, channel) {
      if (err) io.emit('toast-error', 'Could not find channel to send messages to.');
      return channel
    })
    .populate('messages').exec(async (err, channel) => {
      const author = await User.findById(params.user._id).exec();
      const newMessage = new Message({
        author: author,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        text: params.message,
      })
      newMessage.save();
      channel.messages.push(newMessage);
      channel.save();

      io.to(params.channelName).emit('new-message', channel.messages);
    });
  });
});

server
  .listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});