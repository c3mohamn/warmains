var express = require('express');
var router = express.Router();
var Char = require('../models/char');


// GET Character Selection page.
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('character');
});

// --------- CREATE NEW CHARACTER ---------
router.post('/create', function(req, res, next) {
    var name = req.body.Name;
    var char_class = req.body.pickclass.toLowerCase();
    var description = req.body.description.toLowerCase();

    // Server side creation validations
    req.checkBody('Name',
    'Name must be between 2 and 12 characters long.').isLength({min:2, max: 12});
    req.checkBody('pickclass',
    'Must choose a class.').isLength({min:1, max: undefined});

    console.log(char_class);

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

        Char.saveChar(newChar, function(err, char) {
            if(err) throw err;
            console.log(char);
        });

        req.flash('success_msg', name + ' created!');
        res.redirect('/character');
    }
});

// --------- DELETE SELECTED CHARACTER ---------
router.post('/delete', function(req, res) {
  // delete the selected character
  console.log("Delete Char post.");
  var uname = req.user.username;
  var char = req.body.pickchar;
  var button = req.body.cbutton;

  if (char && button == 'del') {
    Char.findOneAndRemove({username: uname, name: char}, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }
      req.flash('success_msg', char + ' has been deleted.');
      return res.redirect('/character');
    });
  }

  if (char && button == 'edit') {
    console.log('go to edit char page.');
    res.redirect('/character/' + char);
  }
});

// GET Character Edit Page.
router.get('/edit', ensureAuthenticated, function(req, res, next) {
  res.render('charedit');
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

// Find the characters of the current logged in user
router.get("/find/", function(req, res) {
    Char.find({username: req.user.username},
        function (err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            res.send(result);
            return res.status(200);
        });
});

module.exports = router;
