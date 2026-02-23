// we import the libraries we need
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//WE Import express-session
const session = require("express-session");
//add module to handle paths
const path = require("path");
// import sqlite3 for DB handling
const sqlite3 = require("sqlite3");
// Now we create the express app
const app = express();
//We define a port for the server to listen
const PORT = process.env.PORT || 3000;
// WE configure the way we are going to read the data
app.use(bodyParser.urlencoded({ extended: true }));
// for reading the request in JSON format to manage the data
app.use(bodyParser.json());

//lets set up our session and cookie
app.use(
  session({
    //session name
    name: "my-session_id",
    //secrete phrase to crypt cookie and session
    secret: "my_secret_key_dev",
    // dont rewrite session if are not changes
    resave: false,
    // dont save empty session
    saveUninitialized: false,
    //browser cookie
    cookie: {
      //for dont call javascript from the browser
      httpOnly: true,
      //tru if we are in production enviorenment (https)
      secure: false,
      // session expiration time 30 mins
      maxAge: 1000 * 60 * 30,
    },
  }),
);

// Middle ware to protect paths

function authMiddlewareAdmin(req, res, next) {
  //this will validate if the role on the session is set to admin
  if (req.session.user.role === "admin") {
    next();
  } else {
    res.send(
      "<h3> CANNOT GET ACCESS TO THIS PATH</h3><a href='/login'>Login</a> ",
    );
  }
}
app.get("/private", authMiddlewareAdmin, (req, res) => {
  //create a button that gets localhost:3000/logout
  res.send("<h1>ADMIN LOGED SUCESSFULL</h1><a href='/logout'>LOGOUT</a>");
});

//creatr a logout route to use when the server gets on the path
app.get("/logout", (req, res) => {
  console.log("testing before logout", req.session);
  //destroying session on request
  req.session.destroy((err) => {
    if (err) return res.send("error closing session");
    //destroying browser cookie
    res.clearCookie("my-session_id");
    res.send("<h1> logout sucesfully </h1>");
    //it works thanks for watching
    console.log("testing after logout:", req.session);
  });
});

// create DB engine
const db = new sqlite3.Database("./users.db", (err) => {
  //handling errors for console printing
  if (err) console.error("Error connecting DB", err.message);
  // printing sucesfully conection to DB
  else console.log("Conected to sqlite3 DATABASE");
});

// we create a route for testing app conection
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

//Create a rout for handling getting Login request
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/login.html"));
});

// create a route for handling POST request from /login form
app.post("/login", async (req, res) => {
  //sorry we need to read the data of the request
  const { email, password } = req.body;
  //we are going to test how to encrypt a password
  //lets print in server console
  console.log("Testing Login");
  console.log("email: ", email);
  console.log("password: ", password);

  //Searching in database
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("server error");
    }
    if (!row) {
      return res.send("<h3>User dont found </h3><a href='/login'> back </a>");
    }

    //testing comparing password with database password
    const match = await bcrypt.compare(password, row.password);
    // if match returns true
    if (match) {
      //let set the data in our cookie
      req.session.user = {
        id: row.id,
        email: row.email,
        role: row.role,
      };
      //it works, next video we are going to develop a secure folder
      console.log("session test:", req.session);
      console.log("session user:", req.session.user);
      console.log("login works!!");
      console.log("user role", row.role);

      res.send(`<h3>
            Welcome ${row.email}
            </h3>
            <p>Role: ${row.role}</p>
            <a href="/"> Back </a>
            `);
    } else {
      //handling wrong password
      console.log("wrong password!!");
      res.send("<h3> Wrong password </h3> a href='/login'> Back </a>");
    }
  });
});

//Run the app in the selected port
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
