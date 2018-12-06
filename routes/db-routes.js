const db = require("../models");

const router = require('express').Router();

router.use(bodyParser.json({limit: '10mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

// Create all our routes and set up logic within those routes where required.
router.post("/save", (req, res) => {
    db.Item.create({ pollyUrl: req.body.pollyUrl, imageUrl: req.body.imageUrl, text: req.body.text })
    .then((dbItem) => {
        return db.User.findOneAndUpdate({ googleId: req.user.googleId }, { $push: { library: dbItem._id } }, { new: true })
    })
    .then((dbUser) => {
        res.render("picture", { user: req.user, src: req.body.pollyUrl, image: req.body.imageUrl, text: req.body.text, dbRedirect: true });
    })
    .catch(err => res.json(err))
});

router.get("/delete/:id", (req, res) => {
    db.Item.findByIdAndDelete(req.params.id)
    .then(() => res.redirect("/library"))
    .catch(err => res.json(err))
})

// Export routes for server.js to use.
module.exports = router;