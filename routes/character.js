var express = require('express');
var router = express.Router();
var Char = require('../models/char');


/* GET Character Selection page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  res.render('character', {title: 'Warmains'});
});

/* --------- CREATE NEW CHARACTER ---------
*  Creates a new character, storing it in the database in char collection.
*/
router.post('/create', function(req, res, next) {
    var name = req.body.Name;
    var char_class = req.body.pickclass.toLowerCase();
    var description = req.body.description.toLowerCase();

    // Making user enters information about the character.
    req.checkBody('Name', 'Enter a name for your character.').notEmpty();
    req.checkBody('Name',
    "Only use letters aA-zZ for your character's name please.").isAlpha();
    req.checkBody('Name',
    'Name must be between 2 and 12 characters long.').isLength({min:2, max:12});
    req.checkBody('pickclass',
    'Must choose a class.').isLength({min:1, max: undefined});
    req.checkBody('description',
    'Description cannot be longer than 255 characters.').isLength({min:0, max:255});

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('character', {
            errors:errors
        });
    } else {
        // Creates a new character and saves it.
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

/* --------- DELETE SELECTED CHARACTER ---------
*  TODO: May change this later, when fixing up character page.
*/
router.post('/delete', function(req, res) {
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
  } else if (char && button == 'edit') {
    console.log('go to edit char page.');
    res.redirect('/character/profile/' + uname + '/' + char);
  }
});

/* GET Character Edit page. */
router.get('/profile/:username/:char', function(req, res) {
  res.render('charprofile', {
    char: req.params.char,
    username: req.params.username
  });
});

// Function to make sure user is logged in before viewing a page.
function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You must be logged in first.');
        res.redirect('/');
    }
}

// Retrieve characters of logged in user from database.
// Primarily used for the character selection page.
router.get("/find/", function(req, res) {
  console.log("Find all characters for current user.");
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

// Find a specific character using user's account name and name of character.
router.get("/findchar/", function(req, res) {
  Char.find({username: req.query.username, name: req.query.charname},
    function (err, result) {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }
      res.send(result);
      return res.status(200);
    });
});

// Save an item to character in database.
router.post('/saveItem', function(req, res) {
  var item = req.body.item;
  var slot = req.body.item_slot.toLowerCase();
  var char = req.body.charname;
  var user = req.user.username;

  console.log(item.Name, slot, char, user);

  Char.findOne({username: user, name: char},
    function (err, char) {
      if (err) {
        console.log(err);
        return res.status(500).send();
      }

      console.log('Found matching character.', char);
      char[slot].id = item.Id;

      char.save(function(err) {
          if (err) throw err;
      });

    });


});

module.exports = router;
