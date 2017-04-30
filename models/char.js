var mongoose = require('mongoose');

//char Schema
var CharSchema = mongoose.Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    class: {type: String, required: true},
    description: String,
    // items
    head: {id: String, gems: [String], enchant: String},
    neck: {id: String, gems: [String], enchant: String},
    shoulders: {id: String, gems: [String], enchant: String},
    back: {id: String, gems: [String], enchant: String},
    chest: {id: String, gems: [String], enchant: String},
    wrist: {id: String, gems: [String], enchant: String},
    hands: {id: String, gems: [String], enchant: String},
    waist: {id: String, gems: [String], enchant: String},
    legs: {id: String, gems: [String], enchant: String},
    feet: {id: String, gems: [String], enchant: String},
    finger1: {id: String, gems: [String], enchant: String},
    finger2: {id: String, gems: [String], enchant: String},
    trinket1: {id: String, gems: [String], enchant: String},
    trinket2: {id: String, gems: [String], enchant: String},
    mainhand: {id: String, gems: [String], enchant: String, mh_type: String},
    offhand: {id: String, gems: [String], enchant: String, oh_type: String},
    ranged: {id: String, gems: [String], enchant: String}
});

var Char = module.exports = mongoose.model('Char', CharSchema);

module.exports.saveChar = function(newChar, callback) {
    newChar.save(callback);
}
