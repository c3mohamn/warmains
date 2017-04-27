var mongoose = require('mongoose');

//char Schema
var CharSchema = mongoose.Schema({
    username: {type: String},
    name: {type: String, index: true},
    class: {type: String},
    description: {type: String},
    // items
    head_id: {type: String},
    neck_id: {type: String},
    shoulders_id: {type: String},
    back_id: {type: String},
    chest_id: {type: String},
    bracer_id: {type: String},
    gloves_id: {type: String},
    belt_id: {type: String},
    pants_id: {type: String},
    feet_id: {type: String},
    ring1_id: {type: String},
    ring2_id: {type: String},
    trinket1_id: {type: String},
    trinket2_id: {type: String},
    mainhand_id: {type: String},
    offhand_id: {type: String},
    ranged_id: {type: String}
});

var Char = module.exports = mongoose.model('Char', CharSchema);

module.exports.createChar = function(newChar, callback) {
    newChar.save(callback);
}
