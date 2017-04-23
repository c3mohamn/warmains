var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/register', function(req, res) {
  res.render('register');
  console.log("Rendering Register Page");
});

router.get('/login', function(req, res) {
  res.render('login');
  console.log("Rendering Login Page");
});

// --------- REGISTER USER ---------
router.post('/register', function(req, res){
    var username = req.body.userfield.toLowerCase();
    var password1 = req.body.pass1field.toLowerCase();
    var password2 = req.body.pass2field.toLowerCase();
    var email = req.body.emailfield.toLowerCase();

    //req.checkBody('email', 'Email is required.').notEmpty();
    //req.checkBody('email', 'Invalid Email.').isEmail();
    //req.checkBody('username', 'Username is required.').notEmpty();
    //req.checkBody('password1', 'Password is required.').notEmpty();
    //req.checkBody('password2', 'Passwords do not match.').equals(password1);

    // TODO: create server side validations
    var errors = req.validationErrors();

    if(errors){
        res.rend('register', {
            errors:errors
        });
    } else {
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
    }
});

// --------- LOGIN ---------
passport.use(new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
        if(err) throw err;
        if(!user) {
            return done(null, false, {message: 'Unknown User'});
        }
        User.comparePassword(password, user.password, function(err, isMatch) {
            if(err) throw err;
            if(isMatch) {
                console.log("Logged in as " + user.username + ".");
                return done(null, user);
            } else {
                console.log("Invalid Password");
                return done(null, false, {message: 'Invalid password.'});
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
passport.authenticate('local', {
    successRedirect: '/', failureRedirect: '/users/login', failureFlash: true
}), function(req, res) {
    res.redirect('/');
});



router.get('/logout', function(req, res, user) {
    req.logout();
    req.flash('success_msg', 'You have logged out.');
    res.redirect('/')
});

router.get("/CurUser/", function(req, res) {
    User.findOne({username: req.session.user.username},
        function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send();
        }
        res.send(user);
        return res.status(200);
    });
});

router.get("/AllUser/", function(req, res) {
    console.log("Getting All Users.");
    User.find({},
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
