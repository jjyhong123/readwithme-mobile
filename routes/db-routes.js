const db = require("../models");

const router = require('express').Router();

// Create all our routes and set up logic within those routes where required.
router.post("/save", (req, res) => {
    db.Item.create({ pollyUrl: req.body.pollyUrl, text: req.body.text })
    .then((dbItem) => {
        return db.User.findOneAndUpdate({ googleId: req.body.googleId }, { $push: { library: dbItem._id } }, { new: true })
    })
    .then((dbUser) => {
        res.render("picture", { user: req.user, src: req.body.pollyUrl, text: req.body.text, dbRedirect: true });
    })
    .catch(err => res.json)
});

// Export routes for server.js to use.
module.exports = router;