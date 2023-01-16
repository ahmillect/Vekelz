// External Variables
const express = require("express");
const session = require("express-session");
const path = require("path");

// Require the dotenv to attach environment variables to the process object
require("dotenv").config();

// App Variables
const app = express();
const port = process.env.PORT || "8000";

// Set Views File
app.set("views", path.join(__dirname, "Views"));

// Set View Engine
app.set("view engine", "ejs");

// Middleware
app.use(session({ secret: "secret", saveUninitialized: true, resave: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/Media", express.static(__dirname + "/Media"));
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

// Importing Routes
const guestRoute = require("./Routes/guestRoute");
const userRoute = require("./Routes/userRoute");
const carRoute = require("./Routes/carRoute");

// Using Routes
app.use("", guestRoute);
app.use("/api", guestRoute);
app.use("/api/user", userRoute);
app.use("/api/cars", carRoute);

// Listen to start request
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}.`);
});

module.exports = app;
