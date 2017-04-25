var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/register', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.get('/chardev', function(req, res) {
    res.render('character');
});

// --------- REGISTER USER ---------
router.post('/register', function(req, res){
    var username = req.body.userfield.toLowerCase();
    var password1 = req.body.pass1field.toLowerCase();
    var password2 = req.body.pass2field.toLowerCase();
    var email = req.body.emailfield.toLowerCase();

    // Server side registration validations
    req.checkBody('userfield',
    'Username must be 2 to 20 characters long.').isLength({min:2, max: 20});
    req.checkBody('pass1field',
    'Password must be 6 to 20 characters long.').isLength({min:6, max: 20});
    req.checkBody('pass2field', 'Passwords do not match.').equals(password1);
    req.checkBody('emailfield', 'Invalid Email.').isEmail();

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('register', {
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

        req.flash('success_msg', 'You are registered ' + username + '!');
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
