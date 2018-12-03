const db = require("../models");

const router = require('express').Router();

// Create all our routes and set up logic within those routes where required.
router.get("/", (req, res) => {
  res.render("index", { user: req.user })
})

router.get("/picture", (req, res) => {
  if (req.session.obj) {
    let obj = req.session.obj
    req.session.obj = null;
    res.render("picture", { user: req.user, src: obj.src, image: obj.image, text: obj.text })
  }
  else {
    res.render("picture", { user: req.user })
  }
})

router.get("/library", (req, res) => {

  if (req.user) {
    db.User.findOne({ googleId: req.user.googleId })
    .populate("library")
    .then((dbUser) => {
      res.render("library", { user: dbUser })
    })
    .catch((err) => res.json(err))
  } else {
    res.json("You must sign in to access this page.")
  }
})

// Export routes for server.js to use.
module.exports = router;