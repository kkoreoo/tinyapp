const bcrypt = require('bcryptjs');

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  uZinGM: {
    id: "uZinGM",
    email: "a@a.com",
    password: bcrypt.hashSync("1234", 10),
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "b@b.com",
    password: bcrypt.hashSync("4321", 10),
  },
};

module.exports = { urlDatabase, users };