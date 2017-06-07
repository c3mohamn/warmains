var express = require('express');
var router = express.Router();

/* GET Index page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Warmains' });
});

/* GET changelog page. */
router.get('/changelog', function(req, res, next) {
  res.render('changelog', { title: 'Changelog' });
});

module.exports = router;
