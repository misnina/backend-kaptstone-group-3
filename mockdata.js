const user01 = {
  id: 0,
  username: 'ladyDear',
  password: 'secret',
  createdAt: Date.now(),
  about: '',
  friends: [],
}

const user02 = {
  id: 1,
  username: 'buddyGuy',
  password: 'secret',
  createdAt: Date.now(),
  about: 'My friends are great!',
  friends: [
    user01,
  ],
}

const message01 = {
  id: 0,
  author: user01,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  text: `One two three four five.`,
}

const message02 = {
  id: 1,
  author: user02,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  text: `Why are we counting?`,
}


const db = {
  users: [
    {
      user01,
      user02
    }
  ],
  channes: [
    {
      name: 'general',
      displayName: 'General',
      rules: [
        `#1`,
        `#2`,
        `#3`
      ],
      messages: [
        message01,
        message02,
      ]
    },
    {
      name: 'gaming',
      displayName: 'Gaming',
      rules: [
        `#1`,
        `#2`,
        `#3`
      ],
      messages: []
    },
  ]
}

module.exports = {
  db
};