var express = require('express');
var router = express.Router();
var Char = require('../models/char');

/* GET Search page. */
router.get('/', function(req, res, next) {
  res.render('search', {title: 'Warmains'});
})

/* Get all the users in the database. */
router.get("/findChars/", function(req, res) {
  console.log("Getting All Matching Characters.");

  var char_name = req.query.charname.toLowerCase();

  Char.find({name: RegExp(char_name)},
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
