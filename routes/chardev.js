var express = require('express');
var router = express.Router();
var Char = require('../models/char');


/* GET Profile page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('character');
});

// --------- CREATE NEW CHARACTER ---------
router.post('/charcreate', function(req, res, next) {
    var name = req.body.Name.toLowerCase();
    var char_class = req.body.Class.toLowerCase();
    var description = req.body.description.toLowerCase();

    // Server side creation validations
    req.checkBody('Name',
    'Name must be between 2 and 12 characters long.').isLength({min:2, max: 12});
    req.checkBody('Class', 'Must choose a class.').isEmpty();

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('character', {
            errors:errors
        });
    } else {
        var newChar = new Char({
            username: req.user.username,
            name: name,
            class: char_class,
            description: description
        });

        Char.createChar(newChar, function(err, char) {
            if(err) throw err;
            console.log(char);
        });

        req.flash('success_msg', name + ' created!');
        res.redirect('/chardev');
    }
});

// Make sure user is logged in first
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You must be logged in first.');
        res.redirect('/');
    }
}

module.exports = router;
