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
    back_id: {id: String, gems: [String], enchant: String},
    chest_id: {id: String, gems: [String], enchant: String},
    bracer_id: {id: String, gems: [String], enchant: String},
    gloves_id: {id: String, gems: [String], enchant: String},
    belt_id: {id: String, gems: [String], enchant: String},
    pants_id: {id: String, gems: [String], enchant: String},
    feet_id: {id: String, gems: [String], enchant: String},
    ring1_id: {id: String, gems: [String], enchant: String},
    ring2_id: {id: String, gems: [String], enchant: String},
    trinket1_id: {id: String, gems: [String], enchant: String},
    trinket2_id: {id: String, gems: [String], enchant: String},
    mainhand_id: {id: String, gems: [String], enchant: String, mh_type: String},
    offhand_id: {id: String, gems: [String], enchant: String, oh_type: String},
    ranged_id: {id: String, gems: [String], enchant: String}
});

var Char = module.exports = mongoose.model('Char', CharSchema);

module.exports.saveChar = function(newChar, callback) {
    newChar.save(callback);
}
