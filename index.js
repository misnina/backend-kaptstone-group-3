const express = require('express');
let db = require('./mockdata');
const app = express();
const port = 3000;

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

app.get('/', (req, res) => {
  res.send('Hello World');
});

/* USERS */

app.get('/users', (req, res) => {
  if (db.users.length === 0) res.status(404).send("Couldn't find any users");
  res.status(200).json(db.users);
});

app.get('/users/:id', (req, res) => {
  let foundUser = db.users.find(user => user.id === +req.params.id);
  if (!foundUser) {
    res.status(404).send('User could not be found');
  }

  res.status(200).json(foundUser);
})


app.post('/users', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send('Did not include username and/or password');
  }

  const newUser = {
    id: userid,
    username: req.body.username,
    password: req.body.password,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    profile: {
      age: req.body.age || null,
      birthday: 
        req.body.birthday ?
        new Date(req.body.birthday)
        : null,
      location: req.body.location || '',
      about: req.body.about || '',
    },
    friends: [],
    private_channels: [],
    public_channels: [...db.public_channels]
  }

  userid++;

  db.users.push(newUser);
  res.status(200).json(db.users);
});


app.delete('/users/:id', (req, res) => {
  let doesExist = db.users.find(user => user.id === +req.params.id);
  if (!doesExist) {
    res.status(404).send('User could not be deleted because it was not found');
  }

  db.users = db.users.filter(user => !(user.id === +req.params.id));
  res.status(200).json(db.users);
});


app.patch('/users/:id', (req, res) => {
  let updatedUserIndex = db.users.findIndex(user => user.id === +req.params.id);
  if (updatedUserIndex === -1) {
    res.status(404).send('User could not be updated because it was not found');
  }

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

  res.status(200).json(db.users);
});

app.patch('/friend/:id', (req, res) => {
  let updatedUserIndex = db.users.findIndex(user => user.id === +req.params.id);
  if (updatedUserIndex === -1) {
    res.status(404).send('User could not be updated because it was not found');
  }

  let foundFriend = db.users.find(user => user.id === +req.body.id);
  if (!(foundFriend)) {
    res.status(404).send('User could not be friended because it was not found');
  }

  if (!db.users[updatedUserIndex].friends.includes(foundFriend.id)) {
    db.users[updatedUserIndex].friends.push(foundFriend.id);
    res.status(200).json(db.users);
  } else {
    res.status(409).send('User already friended');
  }
});

app.delete('/friend/:id', (req, res) => {
  let updatedUserIndex = db.users.findIndex(user => user.id === +req.params.id);
  if (updatedUserIndex === -1) {
    res.status(404).send('User could not be updated because it was not found');
  }

  let foundFriend = db.users.find(user => user.id === +req.body.id);
  if (!(foundFriend)) {
    res.status(404).send('User could not be unfriended because it was not found');
  }

  if (db.users[updatedUserIndex].friends.includes(foundFriend.id)) {
    db.users[updatedUserIndex].friends =
    db.users[updatedUserIndex].friends.filter(friendid => {
      return friendid !== foundFriend.id
    });
    res.status(200).json(db.users);
  } else {
    res.status(409).send('User could not be removed from friend because they are not friends with this person.');
  }
});

/* PUBLIC CHANNELS */

app.get('/channels/public/', (req, res) => {
  if (db.public_channels === 0) res.status(404).send("Couldn't find any channels");
  res.status(200).json(db.public_channels);
});

/* PRIVATE CHANNELS */

app.get('/channels/private/', (req, res) => {
  if (db.private_channels === 0) res.status(404).send("Couldn't find any channels");
  res.status(200).json(db.private_channels);
});

/* MESSAGES */

app.get('/channels/:access/:id/messages/', (req, res) => {
  let accessName = '';
  if (req.params.access === 'public') accessName = 'public_channels';
  if (req.params.access === 'private') accessName = 'private_channels';
  if (!accessName) res.status(404).send("Not a correct channel category.");

  let foundChannel = db[accessName].find(channel => +req.params.id === channel.id);
  if (!foundChannel) res.status(404).send("Could not find channel");
  res.status(200).json(foundChannel.messages);
});

app.post('/channels/:access/:id/messages/', (req, res) => {
  //either figure out permissions once we have a token or in frontend
  if (!req.body.author.id && !req.body.text) {
    res.status(400).send("Author and/or message text were not included.");
  }

  let accessName = '';
  if (req.params.access === 'public') accessName = 'public_channels';
  if (req.params.access === 'private') accessName = 'private_channels';
  if (!accessName) res.status(404).send("Not a correct channel category.");

  let foundChannelIndex = db[accessName].findIndex(channel => +req.params.id === channel.id);
  if (foundChannelIndex === -1) res.status(404).send("Message could not be sent because the channel could not be found.");

  const newMessage = {
    id: messageid,
    author: req.body.author.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    text: req.body.text,
  }
  messageid++;

  db[accessName][foundChannelIndex].messages.push(newMessage);
  res.status(200).json(db[accessName][foundChannelIndex]);
});

app.delete('/channels/:access/:channelId/messages/:messageId', (req, res) => {
  let accessName = '';
  if (req.params.access === 'public') accessName = 'public_channels';
  if (req.params.access === 'private') accessName = 'private_channels';
  if (!accessName) res.status(404).send("Not a correct channel category.");

  let foundChannelIndex = db[accessName].findIndex(channel => +req.params.channelId === channel.id);
  if (foundChannelIndex === -1) res.status(404).send("Message could not be deleted because the channel could not be found.");

  const messageIndex = db[accessName][foundChannelIndex].messages.findIndex(message => {
    return message.id === +req.params.messageId;
  });

  if (messageIndex === -1) res.status(404).send("Message could not be be found.");

  db[accessName][foundChannelIndex].messages.splice(messageIndex, 1);
  res.status(200).json(db[accessName][foundChannelIndex]);
});

app.patch('/channels/:access/:channelId/messages/:messageId', (req, res) => {
    if (!req.body.text) {
    res.status(400).send("Author and/or message text were not included.");
  }

  let accessName = '';
  if (req.params.access === 'public') accessName = 'public_channels';
  if (req.params.access === 'private') accessName = 'private_channels';
  if (!accessName) res.status(404).send("Not a correct channel category.");

  let foundChannelIndex = db[accessName].findIndex(channel => +req.params.channelId === channel.id);
  if (foundChannelIndex === -1) res.status(404).send("Message could not be deleted because the channel could not be found.");

  const messageIndex = db[accessName][foundChannelIndex].messages.findIndex(message => {
    return message.id === +req.params.messageId;
  });

  if (messageIndex === -1) res.status(404).send("Message could not be be found.");

  const updatedMessage = {
    ...db[accessName][foundChannelIndex].messages[messageIndex],
    updatedAt: Date.now(),
    text: req.body.text,
  }
  
  db[accessName][foundChannelIndex].messages[messageIndex] = updatedMessage;
  res.status(200).json(db[accessName][foundChannelIndex]);
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
