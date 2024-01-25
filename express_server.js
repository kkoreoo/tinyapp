const express = require('express');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');
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

// Users Database
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
  res.render("register");
});

// REGISTRATION-POST /// Retrieves the Registration data inputted
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password || getUserByEmail(users, email)) {
    return res.status(400).send("Error: Status Code 400");
  }

  const user = {
    id: userID,
    email,
    password: hashedPassword,
  };

  users[userID] = user;

  res.redirect("/urls");
});

// LOGIN-GET // Renders login page
app.get("/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect('/urls');
  }
  res.render('login');
});

// LOGIN-POST /// Retrieves login info from input
app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserByEmail(users, email);

  if (!email || !password || !id || !bcrypt.compareSync(password, users[id].password)) {
    return res.status(403).send("Error: Incorrect Email and/or Password");
  }

  req.session.user_id = users[id].id;
  res.redirect('/urls');
});

// LOGOUT-POST /// Logouts out the user
app.post("/logout", (req, res) => {
  req.session = null;
  // res.clearCookie('user_id');
  res.redirect("/login");
});

// URL HOME-GET ///  Displays all the URLs in the database
app.get("/urls", (req, res) => {

  // user based off registration cookie value
  const user = req.session.user_id;

  if (!user) {
    return res.status(401).send('Please login to see the urls listed');
  }

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

  if (!user) {
    return res.status(401).send("You must be logged in to use this feature!");
  }
  const shortID = generateRandomString();

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
  
  if (!user) {
    return res.status(401).send("Please log in to make any changes");
  } else if (!urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist, try a different one");
  }

  const usersUrls = urlsForUser(user);

  if (!Object.keys(usersUrls).includes(shortUrl)) {
    return res.status(403).send("Unable to make changes to a URL that is not associated with your account.");
  }

  res.redirect(`/urls/${shortUrl}`);
});

// EDIT-POST // Upon submitting the new long url, will replace existing one.
app.post("/urls/:id/", (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/`);
});

// SHORTURL-REDIRECT-READ /// When clicked on the short url -> redirects to the listed website
app.get("/u/:id", (req, res) => {
  const urlID = req.params.id;

  const longURL = urlDatabase[urlID];
  res.redirect(longURL);
});

// DELETE-POST /// Will delete the selected url and return to the /urls page
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;

  if (!user) {
    return res.status(401).send("Please log in to make any changes");
  } else if (!urlDatabase[shortUrl]) {
    return res.status(400).send("Url does not exist, please check and try again.");
  }
  
  const usersUrls = urlsForUser(user);

  if (!Object.keys(usersUrls).includes(shortUrl)) {
    return res.status(403).send("Unable to make changes to a URL that is not associated with your account.");
  }

  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

// URL INDIVIDUAL PAGE-GET /// Will show the individual URL in it's own page.
app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const shortUrl = req.params.id;

  if (!user) {
    return res.status(401).send("Please login to access this page!");
  } else if (!urlDatabase[shortUrl]) {
    return res.status(400).send("Sorry this url does not exist, try a different one!");
  }

  const userUrls = urlsForUser(user);

  if (!Object.keys(userUrls).includes(shortUrl)) {
    return res.status(403).send("Sorry this is url is not associated with your account.");
  }

  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl].longURL, user, users };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});