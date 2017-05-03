var mongoose = require('mongoose');

//char Schema
var CharSchema = mongoose.Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    class: {type: String, required: true},
    description: String,
    // items
    head: {item: Object, gems: [String], enchant: String},
    neck: {item: Object, gems: [String], enchant: String},
    shoulders: {item: Object, gems: [String], enchant: String},
    back: {item: Object, gems: [String], enchant: String},
    chest: {item: Object, gems: [String], enchant: String},
    wrist: {item: Object, gems: [String], enchant: String},
    hands: {item: Object, gems: [String], enchant: String},
    waist: {item: Object, gems: [String], enchant: String},
    legs: {item: Object, gems: [String], enchant: String},
    feet: {item: Object, gems: [String], enchant: String},
    finger1: {item: Object, gems: [String], enchant: String},
    finger2: {item: Object, gems: [String], enchant: String},
    trinket1: {item: Object, gems: [String], enchant: String},
    trinket2: {item: Object, gems: [String], enchant: String},
    mainhand: {item: Object, gems: [String], enchant: String},
    offhand: {item: Object, gems: [String], enchant: String},
    ranged: {item: Object, gems: [String], enchant: String}
});

var Char = module.exports = mongoose.model('Char', CharSchema);

module.exports.saveChar = function(newChar, callback) {
    newChar.save(callback);
}
