const dm = {
  id: 0,
  displayName: '',
  messages: [],
}

const user01 = {
  id: 0,
  username: 'ladyDear',
  password: 'secret',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  profile: {
    age: 20,
    birthday: new Date('December 25, 1991'),
    location: 'San Andres, GTA',
    about: '',
  },
  friends: [],
  private_channels: [
    0,
  ],
  public_channels: [
    0,
    1,
  ]
}

const user02 = {
  id: 1,
  username: 'buddyGuy',
  password: 'secret',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  profile: {
    age: null,
    birthday: null,
    location: '',
    about: 'My freinds are great!',
  },
  friends: [
    0,
  ],
  private_channels: [
    dm,
  ],
  public_channels: [
    0,
    1
  ]
}

const message01 = {
  id: 0,
  author: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  text: `One two three four five.`,
}

const message02 = {
  id: 1,
  author: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  text: `Why are we counting?`,
}


let db = {
  users: [
    user01,
    user02
  ],
  messages: [],
  channels: [
    {
      name: 'general',
      messages: []
    },
    {
      name: 'random',
      messages: []
    }
  ]
}

module.exports = db;