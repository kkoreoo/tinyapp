const express = require('express');
const app = express();
const PORT = 8080; 

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString () {
  let shortID = '';
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    shortID += char.charAt(Math.floor(Math.random() * char.length));
  }
  return shortID;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  shortID = generateRandomString();
  urlDatabase[shortID] = req.body.longURL 
  res.redirect(`/urls/${shortID}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})

// app.get("/urls/:id", (req, res) => {
//   const shortUrl = req.params.id;
//   const templateVars = { id: shortUrl, longURL: urlDatabase[shortUrl] }
//   res.render("urls_show", templateVars);
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});