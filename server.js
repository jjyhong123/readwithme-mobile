// handlebars version
require("dotenv").config()

var express = require("express");
var bodyParser = require("body-parser");
var PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const keys = require("./config/keys/keys");
const passportSetup = require('./config/passport-setup');
const authRoutes = require('./routes/auth-routes');
const displayRoutes = require('./routes/display-routes');
const apiRoutes = require('./routes/api-routes');
const dbRoutes = require('./routes/db-routes');
const cookieSession = require('cookie-session');
const passport = require("passport");
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// set up session cookies
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/readwithme";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Define API routes here
app.use('/auth', authRoutes);
app.use('/api', apiRoutes)
app.use('/db', dbRoutes)
app.use('/', displayRoutes)

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

/////////////////////////////////////////////

