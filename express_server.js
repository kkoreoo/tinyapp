const express = require('express');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser, checkValidAccess } = require('./helpers');
const { urlDatabase, users } = require('./database');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

// configs our render to ejs
app.set("view engine", "ejs");

// HOME DIRECTORY-GET /// Redirect user to URLs if logged in, otherwise will be sent to login page
app.get('/', (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect('/urls');
});

// REGISTRATION-GET /// Renders the page /register
app.get("/register", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  }

  // data to load header
  const templateVars = {
    user,
    users,
  };

  res.render("register", templateVars);
});

// REGISTRATION-POST /// Retrieves the Registration data inputted
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // registering without an email and/or password
  if (!email || !password) {
    return res.status(400).send("Sorry could not register your account. Please double check that you are inputting an email and password.");
  
  // email already in use 
  } else if (getUserByEmail(users, email)) {
    return res.status(400).send("Sorry, this email is already in use");
  }
  
  // user object to hold user's details
  const user = {
    id: userID,
    email,
    password: hashedPassword,
  };

  // adding user to database and sets user's cookie
  users[userID] = user;
  req.session.user_id = users[userID].id;

  res.redirect("/urls");
});

// LOGIN-GET // Renders login page
app.get("/login", (req, res) => {
  const user = req.session.user_id;

  // user logged in already
  if (user) {
    return res.redirect('/urls');
  }

  // data to load header
  const templateVars = {
    user,
    users,
  };

  res.render('login', templateVars);
});

// LOGIN-POST /// Retrieves login info from input
app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserByEmail(users, email);

  // no email and/or password, invalid email, or password associated with email does not match inputted password
  if (!email || !password || !id || !bcrypt.compareSync(password, users[id].password)) {
    return res.status(403).send("Error: Incorrect Email and/or Password");
  }

  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

// LOGOUT-POST /// Logouts out the user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// URL HOME-GET ///  Displays all the URLs in the database
app.get("/urls", (req, res) => {

  // user based off registration cookie value
  const user = req.session.user_id;

  // if user is not logged in
  if (!user) {
    return res.redirect('/login');
  }

  // finds all the urls associated with the user 
  const userUrls = urlsForUser(user);

  const templateVars = {
    user,
    users,
    urls: userUrls
  };

  res.render("urls_index", templateVars);
});

// ADD URL-GET /// Page to enter a new url;
app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    return res.redirect('/login');
  }
  const templateVars = { user, users };
  res.render("urls_new", templateVars);
});

// ADD URL-POST /// New Url added will redirect to show only that url in our website
app.post("/urls", (req, res) => {
  const user = req.session.user_id;

  // not logged in or submitting an empty form for a long URL
  if (!user) {
    return res.status(401).send("You must be logged in to use this feature!");
  } else if (!req.body.longURL) {
    return res.status(401).send("Please enter a URL into the form");
  }

  const shortID = generateRandomString();

  // adding the url to the database
  urlDatabase[shortID] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };

  res.redirect(`/urls/${shortID}`);
});

// EDIT-READ /// Will redirect user to urls unique page to edit
app.get("/urls/:id/edit", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;
  
  // checking if they have valid access to request url
  if (!checkValidAccess(user, res, shortUrl)) return;

  res.redirect(`/urls/${shortUrl}`);
});

// EDIT-POST // Upon submitting the new long url, will replace existing one.
app.post("/urls/:id/", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;

  // checking if they have valid access to url
  if (!checkValidAccess(user, res, shortUrl)) {
    return;

  // if they submit an empty form for the long URL
  } else if (!req.body.longURL) {
    return res.status(401).send("Please enter a URL into the form");
  }

  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/`);
});

// SHORTURL-REDIRECT-READ /// When clicked on the short url -> redirects to the listed website
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;

  // if the user attempts to reach an invalid short URL
  if (!urlDatabase[urlID]) {
    return res.status(404).send("Sorry this URL ID does exist in our database, try a different one or add it using our create function!");
  }

  const longURL = urlDatabase[urlID].longURL;
  res.redirect(longURL);
});

// DELETE-POST /// Will delete the selected url and return to the /urls page
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;

  // checking if they have valid access to url
  if (!checkValidAccess(user, res, shortUrl)) return;

  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

// URL INDIVIDUAL PAGE-GET /// Will show the individual URL in it's own page.
app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;

  // checking if they have valid access to url
  if (!checkValidAccess(user, res, shortUrl)) return;

  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, user, users };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});