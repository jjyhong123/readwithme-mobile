const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema 
const UserSchema = new Schema({
    username: String,
    googleId: String,
    library: [
        {
            type: Schema.Types.ObjectId,
            ref: "item"
        }
    ]
});

const User = mongoose.model('user', UserSchema);

module.exports = User;