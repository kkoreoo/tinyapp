const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; 

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

// READ // Renders the page /register
app.get("/register", (req, res) => {
  res.render("register");
});

// CREATE // Retrieves the Registration data inputted
// app.post("/register", (req, res) => {

// })

// CREATE /// Retrieves Login username from input
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

// CREATE /// Logouts out the user
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("urls");
});

// READ ///  Displays all the URLs in the database
app.get("/urls", (req, res) => {
  
  const templateVars = { 
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

// ADD /// Page to enter a new url;
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// CREATE /// New Url added will redirect to show only that url in our website
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
  const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl], username: req.cookies["username"] }
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});