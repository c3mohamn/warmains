var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');

//email used for sending password reset info.
var smtpTransport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: 'warmains.passreset@gmail.com',
      pass: 'warmains'
  }
});

router.get('/register', function(req, res) {
  res.render('register');
});

router.get('/login', function(req, res) {
  res.render('login');
});

// --------- REGISTER USER ---------
router.post('/register', function(req, res){
    var username = req.body.userfield.toLowerCase();
    var password1 = req.body.pass1field.toLowerCase();
    var password2 = req.body.pass2field.toLowerCase();
    var email = req.body.emailfield.toLowerCase();

    // Server side registration validations
    req.checkBody('userfield',
    'Username must be 2 to 16 characters long.').isLength({min:2, max: 16});
    req.checkBody('pass1field',
    'Password must be 6 to 18 characters long.').isLength({min:6, max: 18});
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
        newUser.save(function(err) {
            console.log(newUser);
        });
        req.flash('success_msg', 'You are registered ' + username + '!');
        res.redirect('/');
    }
});

// --------- PASSWORD CHANGE ---------
router.post('/changeinfo', function(req, res) {
    var prevpass = req.body.oldpass.toLowerCase();
    var newpass = req.body.newpass.toLowerCase();
    var newpass_confirm = req.body.newpassconfirm.toLowerCase();
    var cur_pass = req.user.password;
    var username = req.user.username;

    // Server side registration validations
    req.checkBody('newpass',
    'Enter a new password with at least 6 characters.').isLength({min:6, max: 20});
    req.checkBody('newpassconfirm', 'New passwords do not match.').equals(newpass);

    var errors = req.validationErrors();

    if(errors){
        console.log(errors);
        res.render('profile', {
            errors:errors
        });
    } else {
        User.comparePassword(prevpass, cur_pass, function(err, isMatch) {
            if(err) throw err;
            if(isMatch) {
                console.log('Current and and oldpass are a match.');
                // change user password and logout user
                req.user.password = newpass;
                req.user.save(function(err) {
                });
                req.logout();
                req.flash('error_msg', 'Password Changed.');
                res.redirect('/');

            } else {
                console.log("incorrect old password.");
                req.flash('error_msg',
                'The old password you entered is incorrect.');
                res.redirect('/profile/' + username);
            }
        });
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

// --------- LOGOUT ---------
router.get('/logout', function(req, res, user) {
    req.logout();
    req.flash('success_msg', 'You have logged out.');
    res.redirect('/');
});

// --------- FORGOT PASSWORD ---------
router.get('/forgot', function(req, res) {
  res.render('forgot');
});

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.forgotemail }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }
        user.resetPasswordToken = token;
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: 'warmains.passreset@gmail.com',
        subject: 'Warmains Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
      console.log("Token sent to user's mail.")
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

// --------- RESET PASSWORD ---------
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token }, function(err, user) {
        if (!user) {
            console.log("Password token invalid/expired: " + req.body.resetpass1);
            req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        user.password = req.body.resetpass1;
        user.resetPasswordToken = undefined;

        // Server side registration validations
        req.checkBody('resetpass1',
        'Enter a password with greater than 6 characters.').isLength({min:6, max: 20});
        req.checkBody('resetpass2',
        'Passwords do not match.').equals(req.body.resetpass1);

        var errors = req.validationErrors();

        if(errors){
            console.log(errors);
            res.render('reset', {
                errors:errors
            });
        } else {
            user.save(function(err) {
                done(err, user);
            });
            console.log("Password reset to: " + req.body.resetpass1);
        }
      });
  },
  function(user, done) {
    var mailOptions = {
      to: user.email,
      from: 'warmains.passreset@gmail.com',
      subject: 'Your password has been changed',
      text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
    };
    smtpTransport.sendMail(mailOptions, function(err) {
      req.flash('success', 'Success! Your password has been changed.');
      done(err);
    });
  }
  ], function(err) {
    res.redirect('/');
  });
});

// For getting information in db for controllers.
router.get("/CurUser/", function(req, res) {
    User.findOne({username: req.user.username},
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
