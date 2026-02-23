//calling the sqlite3 module , for handling
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

//conecting the DATABASE
const db = new sqlite3.Database("./users.db", (err) => {
  //this is for handling errors and printing in console errors
  if (err) return console.error("error creating DB: ", err.message);
  //if connection sucesfully print in console
  console.log("connected to sqlite DATABASE");
});

//creating users table
db.serialize(() => {
  db.run(
    //creating a table and its requirement for data and columns
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT    
    )`,
    (err) => {
      //for handling errors
      if (err) console.error("Error creating the table");
      // or printing sucessfull conection
      else console.log("users table created");
    },
  );

  //create the first user
  const adminEmail = "admin@company.com";
  const adminPassword = "admin123";
  const saltRounds = 10;

  //lets run the database to look if are some users or create one
  db.get(
    "SELECT * FROM users WHERE email = ?",
    [adminEmail],
    async (err, row) => {
      if (err) return console.error;
      if (!row) {
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        db.run(
          "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
          [adminEmail, hashedPassword, "admin"],
          (err) => {
            if (err)
              console.error("unexpected error inserting admin: ", err.message);
            else console.log("admin user created correctly");
            db.close();
          },
        );
      } else {
        console.log("admin user already exists!!!");
        db.close();
      }
    },
  );
});
