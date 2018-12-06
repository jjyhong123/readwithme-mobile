const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema 
const ItemSchema = new Schema({
    image: Buffer,
    pollyUrl: String,
    text: String
});

const Item = mongoose.model('item', ItemSchema);

module.exports = Item;