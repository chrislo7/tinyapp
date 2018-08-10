var express = require("express");
const bcrypt = require("bcrypt");
var app = express();
var PORT = 8080; // default port 8080
var cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    signed: false,
    maxAge: 24 * 60 * 60 * 1000
  })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// ******************** OBJECTS BELOW ********************//

var urlDatabase = {
  "b2xVn2": {
    userID: "VinDiesel",
    link: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: "test2",
    link: "http://www.google.com"
  }
};

const users = {
  test1: {
    userID: "test1",
    email: "test1@example.com",
    password: "123"
  },
  test2: {
    userID: "test2",
    email: "test2@example.com",
    password: "password"
  }
};

// ******************** FUNCTIONS BELOW ********************

// function used to generate random string, mainly used for generating userID
function generateRandomString() {
  var str = "";
  var charBank =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz0123456789";
  for (var x = 0; x < 6; x++) {
    str += charBank.charAt(Math.floor(Math.random() * charBank.length));
  }
  return str;
}

// function to check if an email exists in the user database, mainly used during /login
function existEmail(email) {
  for (user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
}

// function to fetch user ID from the user database, used during login to check if the email inputted by users exists in the database
// if the user exists, this function will return the ID of the corresponding email.
function fetchUserID(email) {
  for (user in users) {
    if (email === users[user].email) {
      var user_id = users[user].userID;
    }
  }
  return user_id;
}

// same function as above, but returns the password of the corresponding email.
function fetchUserPass(pass) {
  for (user in users) {
    if (pass === users[user].password) {
      var user_pass = users[user].password;
    }
  }
  return user_pass;
}

// function utilizing bcrypt.compareSync() to compare between the password input by user and the hashed password on the user database
function comparePass(inputPass) {
  for (user in users) {
    if (bcrypt.compareSync(inputPass, users[user].password)) {
      return true;
    }
  }
  return false;
}

// ******************** APP.GET BELOW ********************

app.get("/", (req, res) => {
  res.end("Hello! This is TinyApp, a URL shorterner.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    userID: req.session.userID,
    urlDatabase: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL].link;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  var userID = req.session.userID;
  if (!userID) {
    res.redirect("/login");
    return;
  } else {
    let templateVars = {
      userID: req.session.userID
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let templateVars = {
    userID: req.session.userID,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].link,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

// ******************** APP.POST BELOW ********************

//main page after login, showing users their links
app.post("/urls", (req, res) => {
  let userID = req.session.userID;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(req.body); // debug statement to see POST parameters
  urlDatabase[shortURL] = { userID: userID, link: longURL };
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

//deletes links
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.body.delete;
  let userID = req.session.userID;
  if (urlDatabase[shortURL].userID != userID) {
    res.sendStatus(300);
  } else {
    delete urlDatabase[shortURL].link;
    res.redirect("http://localhost:8080/urls/");
  }
});

//updates short URLs with new long URL
app.post("/urls/:id/update", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL].link = longURL;
  console.log(longURL);
  res.redirect("http://localhost:8080/urls/");
});

//login page, checks if user exists
app.post("/login", (req, res) => {
  if (comparePass(req.body.passLogin) && fetchUserID(req.body.emailLogin)) {
    req.session.userID = fetchUserID(req.body.emailLogin);
    req.session.userPass = fetchUserPass(req.body.passLogin);
    res.redirect("http://localhost:8080/urls/");
    return;
  } else {
    res.sendStatus(400);
    return;
    res.redirect("/");
  }
});

//utilized to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("http://localhost:8080/login/");
});

//registration page
// checks if there is an email & password entered, if not, sends error msg
// checks if email already exists in database, if it is, sends error
// encrypts password and further encyrpts the cookie that stores the password
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let userID = generateRandomString();

  if (!email || !password) {
    console.log("Missing email & password, please enter!");
    res.status(404).send("404: Missing email & password, please enter!");
  } else {
    let hashedPass = bcrypt.hashSync(password, 10);
    const user = { userID: userID, email: email, password: hashedPass };
    req.session.userID = user.userID;
    if (existEmail(user.email)) {
      res.send("Email already used, try again.");
    } else {
      users[userID] = user;
      res.redirect("/");
    }
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
