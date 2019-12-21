const express = require('express');
const authRouter = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const emailController = require('../email/controller');

/* GET home page. */

const connection = require('../config/databaseConfig');

authRouter.post('/isLogin', ensureAuthenticated, (req, res) => {
  const { token } = req.body;
    connection.query('SELECT * FROM sessions WHERE session_id = ?', [token], (err, rows) => {
        if (err) {
          console.log(err); 
          res.send({success: false});
        } else if (rows.length == 0) {
          res.send({success: false});
        } else {
          res.send({success: true});
        }
    })
});

//Login Handle
authRouter.post('/signin', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    // will generate a 500 error
    if (err) { return next(err); }
    // Generate a JSON response reflecting authentication status
    if (!user) { return res.send({ success : false });}
    req.logIn(user, (err) => {
      if (err) { return next(err);}
      return res.send({ user:user, success : true, token: req.session.id });
    });
  })(req, res, next);
});


authRouter.get('/isAuth', ensureAuthenticated, (req, res) => {
  res.send(JSON.stringify(user));
  // res.render('dashboard', {
  //       name: req.user.username
  //     });
});

// Register Handle
authRouter.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    let errors = [];
  
    // Check required fields
    if(!username || !email || !password ) {
      errors.push({msg: 'Please fill in all fields'});
    }
  
    if (errors.length > 0) {
      res.render('register', {
        errors,
        username,
        email,
        password
      });
    } else {
      //Validation passed
      connection.query(`SELECT * FROM Users WHERE Users.email = '${email}'`, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
          //user exists
          errors.push({ msg: 'Email is already registered'});
          res.send({
            errors,
            username,
            email,
            password
          });
          return ;
        } else {
          //Hash Password
  
          // const sql = "INSERT INTO Users (username, email, password) VALUES ($name, $email, $password)";
  
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, (err, hash) => {
              if(err) throw err;
              //set password
              let user = {username: username, email: email, password: hash};
              let sql = 'INSERT INTO Users SET ?';
              connection.query(sql, user, (err) => {
                  if(err) throw error;
                  req.flash('success_msg', 'You are now registered!! Thank you!');
                  res.send("signup succeed");
              });
            });
          });
        }
      });
    }
  });

authRouter.post('/email', emailController.collectEmail);

authRouter.post('/email/confirm/:id/:email', emailController.confirmEmail);

authRouter.post('/forgot', emailController.forgotEmail);

// router.get('/isAuth', ensureAuthenticated, (req, res) => {
//   res.render('dashboard', {
//     name: req.user.username
//   });
// })

module.exports = authRouter;
