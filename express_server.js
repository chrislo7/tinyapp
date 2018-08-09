var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var generateRandomString = function() {
  var str = "";
  var charBank =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvxyz0123456789";
  for (var x = 0; x < 6; x++) {
    str += charBank.charAt(Math.floor(Math.random() * charBank.length));
  }
  return str;
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "test1": {
    userID: "test1",
    email: "test1@example.com",
    password: "vindieselshead"
  },
  "test2": {
    userID: "test2",
    email: "test2@example.com",
    password: "password"
  }
};

function existence(email) {
  for (key in users) {
    if (email === users[key]["email"]) {
      return true;
    }
  }
  return false;
}


function fetchUserID(email) {
  for (user in users){
    if (email === users[user].email){
      var user_id = users[user].userID;
    }
  }
  return user_id;
}

app.get("/", (req, res) => {
  res.end("Hello! This is TinyApp, a URL shorterner.");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["userID"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["userID"]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login")
})

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["userID"],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log(req.body); // debug statement to see POST parameters
  urlDatabase[shortURL] = longURL;
  res.redirect(`http://localhost:8080/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.body.delete;
  delete urlDatabase[shortURL];
  res.redirect("http://localhost:8080/urls/");
});

app.post("/urls/:id/update", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = req.body.shortURL;
  urlDatabase[shortURL] = longURL;
  console.log(longURL);
  res.redirect("http://localhost:8080/urls/");
});

app.post("/login", (req, res) => {
  res.cookie("userID", fetchUserID(req.body.emailLogin));
  res.redirect("http://localhost:8080/urls/");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("http://localhost:8080/urls/");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  let userID = generateRandomString();
  if (!email || !password) {
    console.log("Missing email & password, please enter!");
    res.status(404).send("404: Missing email & password, please enter!");
  } else {
    const user = { id: userID, email: email, password: password };
    res.cookie("userID", userID);
    if (existence(user.email)) {
      res.send("Email already used, try again.");
    } else {
      users[userID] = user;
      res.redirect("/");
    }
  }
});

app.post("/login", (req, res) => {

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
