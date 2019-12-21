const express = require('express');
const router = express.Router();
// const { ensureAuthenticated } = require('../config/auth');
/* GET home page. */

router.get('/', (req, res) => {
  res.render('index', { title: 'Express' });
});

// router.get('/isAuth', ensureAuthenticated, (req, res) => {
//   res.render('dashboard', {
//     name: req.user.username
//   });
// })

module.exports = router;
