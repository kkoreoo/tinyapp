const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// configs our render to ejs 
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  uZinGM: {
    id: "uZinGM",
    email: "a@a.com",
    password: "1234",
  },
  zNLYPg: {
    id: "zNLYPg",
    email: "b@b.com",
    password: "4321",
  },
};

// will get an array of all the users details, look at all the emails to see if a duplicate is being used for registration creation
function getUserbyEmail (obj, email) {
  let user = '';

  for (let id in obj) {
    if (obj[id].email === email) {
      user = id;
      return user;
    }
  };

  return false;
};


//short ID generator
function generateRandomString () {
  let shortID = '';
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortID += char.charAt(Math.floor(Math.random() * char.length));
  }
  return shortID;
};

// REGISTRATION-GET /// Renders the page /register
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("register", templateVars);
});

// REGISTRATION-POST /// Retrieves the Registration data inputted
app.post("/register", (req, res) => {
  const userID = generateRandomString()
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password || getUserbyEmail(users, email)) {
    return res.status(400).send("Error: Status Code 400");
  } 

  const user = {
    id: userID,
    email,
    password,
  };

  users[userID] = user;

  res.redirect("/urls");
});

// LOGIN-GET // Renders login page 
app.get("/login", (req, res) => {
  res.render('login');
})

// LOGIN-POST /// Retrieves login info from input
app.post("/login", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const id = getUserbyEmail(users,email);

  if(!email || !password || !id || password !== users[id].password) {
    return res.status(403).send("Error: Incorrect Email and/or Password");
  }

  res.cookie('user_id', users[id].id);
  res.redirect('/urls');
})

// CREATE /// Logouts out the user
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

// URL HOME-GET ///  Displays all the URLs in the database
app.get("/urls", (req, res) => {

  // user based off registration cookie value
  const user = users[req.cookies["user_id"]];
  const templateVars = { 
    user, 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// ADD URL-GET /// Page to enter a new url;
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// ADD URL-POST /// New Url added will redirect to show only that url in our website
app.post("/urls", (req, res) => {
  shortID = generateRandomString();
  urlDatabase[shortID] = req.body.longURL 
  res.redirect(`/urls/${shortID}`);
});

// READ /// Will redirect user to urls unique page to edit
app.get("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  res.redirect(`/urls/${shortUrl}`);
});

// UPDATE // Upon submitting the new long url, will replace existing one.
app.post("/urls/:id/", (req, res) => {
  const shortUrl = req.params.id;
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/`);
});

// READ /// When clicked on the short url -> redirects to the listed website
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// DETELE /// Will delete the selected url and return to the /urls page
app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

// READ /// Will show the individual URL in it's own page.
app.get("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const user = users[req.cookies["user_id"]];
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], user }
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});