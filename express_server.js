var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
app.use(cookieParser());

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
}


const users = {
  test1: {
    userID: "VinDiesel",
    email: "test1@example.com",
    password: "imbald"
  },
  test2: {
    userID: "test2",
    email: "test2@example.com",
    password: "password"
  }
};

// ******************** FUNCTIONS BELOW ********************//

function generateRandomString() {
  var str = "";
  var charBank =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz0123456789";
  for (var x = 0; x < 6; x++) {
    str += charBank.charAt(Math.floor(Math.random() * charBank.length));
  }
  return str;
};

function existEmail(email) {
  for (user in users) {
    if (email === users[user].email) {
      return true;
    }
  }
  return false;
}

function existPass(pass) {
  for (user in users) {
    if (pass === users[user].password) {
      return true;
    }
  }
  return false;
}

function fetchUserID(email) {
  for (user in users) {
    if (email === users[user].email) {
      var user_id = users[user].userID;
    }
  }
  return user_id;
}

function fetchUserPass(pass) {
  for (user in users) {
    if (pass === users[user].password) {
      var user_pass = users[user].password;
    }
  }
  return user_pass;
}

// ******************** APP.GET BELOW ********************//

app.get("/", (req, res) => {
  res.end("Hello! This is TinyApp, a URL shorterner.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    urlDatabase: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  var userID = req.cookies.userID;
  if (!userID) {
    res.redirect("/login")
    return;
  }
  else {
    let templateVars = {
      userID: req.cookies["userID"]
    }
    res.render("urls_new", templateVars)
  };
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    shortURL: req.params.id,
    longURL: urlDatabase[shortURL].link,
    urlDatabase: urlDatabase
  };
  res.render("urls_show", templateVars);
});

// ******************** APP.POST BELOW ********************//

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(req.body); // debug statement to see POST parameters
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.body.delete;
  let userID = req.cookies.userID;
  if (urlDatabase[shortURL].userID != userID) {
    res.sendStatus(300);
  } else {
    delete urlDatabase[shortURL];
    res.redirect("http://localhost:8080/urls/");
  }
});

app.post("/urls/:id/update", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL] = longURL;
  console.log(longURL);
  res.redirect("http://localhost:8080/urls/");
});

app.post("/login", (req, res) => {
  if (fetchUserPass(req.body.passLogin) && fetchUserID(req.body.emailLogin)) {
    res.cookie("userID", fetchUserID(req.body.emailLogin));
    res.cookie("userPass", fetchUserPass(req.body.passLogin));
    res.redirect("http://localhost:8080/urls/");
    return;
  } else {
    res.sendStatus(400);
    return;
    res.redirect("/");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("http://localhost:8080/login/");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let userID = generateRandomString();
  if (!email || !password) {
    console.log("Missing email & password, please enter!");
    res.status(404).send("404: Missing email & password, please enter!");
  } else {
    const user = { userID: userID, email: email, password: password };
    res.cookie("userID", userID);
    if (existEmail(user.email)) {
      res.send("Email already used, try again.");
    } else {
      users[userID] = user;
      res.redirect("/");
    }
  }
});

app.post("/login", (req, res) => {});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
