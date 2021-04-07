const express = require('express');
const db = require('./mockdata');
const app = express();
const port = 3000;

//until we get uuid or something going, will just count up on each server reset
let userid = 2;
let messageid = 2;
let public_channelid = 2;
let private_channelid = 1;

db.public_channels.map(channel => {
  db.users.map(user => {
    user.public_channels.push(channel);
  })
});

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
})

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
