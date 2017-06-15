var mongoose = require('mongoose');

//char Schema
var CharSchema = mongoose.Schema({
    username: {type: String, required: true},
    name: {type: String, required: true},
    class: {type: String, required: true},
    race: String,
    spec: String,
    description: String,
    talents: {},
    points: {},
    professions: {},
    glyphs: {},
    // items
    head: {item: Object, gems: Object, enchant: Object},
    neck: {item: Object, gems: Object, enchant: Object},
    shoulders: {item: Object, gems: Object, enchant: Object},
    back: {item: Object, gems: Object, enchant: Object},
    chest: {item: Object, gems: Object, enchant: Object},
    wrist: {item: Object, gems: Object, enchant: Object},
    hands: {item: Object, gems: Object, enchant: Object},
    waist: {item: Object, gems: Object, enchant: Object},
    legs: {item: Object, gems: Object, enchant: Object},
    feet: {item: Object, gems: Object, enchant: Object},
    finger1: {item: Object, gems: Object, enchant: Object},
    finger2: {item: Object, gems: Object, enchant: Object},
    trinket1: {item: Object, gems: Object, enchant: Object},
    trinket2: {item: Object, gems: Object, enchant: Object},
    mainhand: {item: Object, gems: Object, enchant: Object},
    offhand: {item: Object, gems: Object, enchant: Object},
    ranged: {item: Object, gems: Object, enchant: Object}
});

var Char = module.exports = mongoose.model('Char', CharSchema);

module.exports.saveChar = function(newChar, callback) {
    newChar.save(callback);
}
