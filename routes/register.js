var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res) {
  res.render('register');
  console.log("Rendering Register");
});

// Register User
router.post('/', function(req, res){
    var username = req.body.userfield;
    var password1 = req.body.pass1field;
    var password2 = req.body.pass2field;
    var email = req.body.emailfield;

    var newUser = new User({
        username: username,
        password: password1,
        email: email
    });

    User.createUser(newUser, function(err, user) {
        if(err) throw err;
        console.log(user);
    });

    req.flash('success_msg', 'You are registered!');

    res.redirect('/');
});

module.exports = router;
