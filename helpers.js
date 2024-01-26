const { urlDatabase } = require('./database');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true}));

// Given an email will find the user with the associated email if present
const getUserByEmail = (obj, email) => {
  let user = null;

  // loops over user database to identify if it's an existing user
  for (let id in obj) {
    if (obj[id].email === email) {
      user = id;
      return user;
    }
  };

  // not an existing user
  return undefined;
};

//short ID generator
const generateRandomString = () => {
  let shortID = '';
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortID += char.charAt(Math.floor(Math.random() * char.length));
  }
  return shortID;
};

//Identifies which URLs are associated with the user's account
const urlsForUser = (user) => {
  let usersUrls = {};
  for (const id in urlDatabase) {
    if (urlDatabase[id].userID === user) {
      usersUrls[id] = urlDatabase[id].longURL;
    }
  }
  return usersUrls;
};

//invalid access checker
const checkValidAccess = (user, res, shortUrl) => {
  // user is not logged in
  if (!user) {
    return res.status(401).send("Please log in to make any changes");

    // invalid url
  } else if (!urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist, please check and try again.");
  }
  
  const usersUrls = urlsForUser(user);

  // logged in but url is not associated with user
  if (!Object.keys(usersUrls).includes(shortUrl)) {
    return res.status(403).send("Unable to make changes to a URL that is not associated with your account.");
  }
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkValidAccess };