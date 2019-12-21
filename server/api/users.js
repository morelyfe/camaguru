const express = require('express');
const userRouter = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const multer = require('multer');
const sharp = require('sharp'); 
// const passport = require('passport');

//User model
const connection = require('../config/databaseConfig');

//Get all users
userRouter.get('/', (req, res) => {
  connection.query('SELECT * FROM Users', (err, rows) => {
    if (err) throw err;
    // res.send(rows);
    res.send(JSON.stringify(rows));
  })
})

/* GET Login page. */
// userRouter.get('/login', (req, res) => {
//   res.render('login');
// });

userRouter.get('/register', (req, res) => {
  res.render('register');
});



userRouter.post('/select', ensureAuthenticated, (req, res) => {
  connection.query(`SELECT * FROM Users WHERE id = '${req.user.id}'`, (err, result) => {
    if (err) throw err;
    res.json({id: result[0].id, email: result[0].email, username: result[0].username, bio: result[0].bio, isPrivate: result[0].isPrivate, isNotificate: result[0].isNotificate, picture: result[0].picture });
  });

});
// //Login Handle
// userRouter.post('/signin', (req, res, next) => {
//   passport.authenticate('local-signin', {
//     successRedirect: '/dashboard',
//     failureRedirect: '/users/login',
//     failureFlash: true
//   })(req, res, next);
// });

//logout handle
userRouter.get('/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/'); //Inside a callback… bulletproof!
    }
  });
  // req.logout(); //passport middleware function
});



userRouter.post('/update', ensureAuthenticated, (req, res) => {
  //if session and id is same, do the update.
  const { id, email, username, bio } = req.body;
  connection.query(`UPDATE Users SET email = '${email}', username = '${username}', bio = '${bio}' WHERE id = ${id}` , (err) => {
    if (err) {
      console.log(err);
      return res.send({ success: false, errCode: err.code });
    }
    res.send({ success: true })
  })
})

userRouter.post('/updatePassword', ensureAuthenticated, (req, res) => {
  const { email, password, change } = req.body;
  connection.query(`SELECT * FROM Users WHERE email = '${email}'`, (err, rows) => {
    if (err) {
      console.log(err);
      return res.send({ success: false, errCode: err.code });
    }
    if (bcrypt.compareSync(password, rows[0].password) === false) {
      return res.send({success: false, errCode: "PASS_NOT_MATCH"})
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(change, salt, (err, hash) => {
          if (err) throw err;
          connection.query(`UPDATE Users SET password = '${hash}' WHERE email = '${email}'`, (err) => {
            if (err) throw err;
            res.send({ success: true });
          })
          
        })
      })
    }
  })
})

//managing profile image using multer
const storage = multer.diskStorage({
  destination: './public/images/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1000 * 1000 * 10 // 10 MB
} 
}).single('picture');

const ft_upload = async (req, res, next) => {
  let filename = '';
  await upload(req, res, (err) => {
    if (err) {
      res.send({errMsg: err});
    } else {
      filename = req.file.filename;
      connection.query(`SELECT * FROM Users WHERE id = ${req.user.id}`, (err, result) => {
        if (err) { return res.send({ success: false }); }
        if (result[0].picture !== null) {
          fs.unlink(`./public/images/${result[0].picture}`, (err) => {
            if (err) throw err;
            console.log(`${result[0].picture} was successfully deleted!`);
          })
        }
      })
      connection.query(`UPDATE Users SET picture = '${filename}' WHERE id = ${req.user.id}`, (err) => {
        if (err) {
          throw err;
        }
        req.filename = filename;
        next();
      })
      
    }
  });
}

userRouter.post('/updatePicture', ensureAuthenticated, ft_upload, async (req, res, next) => {
  const imagePath = `./public/images/${req.filename}`;
  sharp(imagePath).resize(240, 240).toBuffer( (err, buf) => {
    if (err) {
      return next(err);
    }
    const image = buf.toString('base64');
    fs.writeFile(imagePath, image, {encoding: 'base64'}, (err) => {
      if (err) {
        console.log(err);
        return res.send({success: false});
      }
      return res.send({success: true});
    });
  });
});

userRouter.post('/updatePrivate', ensureAuthenticated, (req, res) => {
  const { id } = req.body;
  connection.query(`SELECT * FROM Users WHERE id = ${id}`, (err, rows) => {
    if (err) { throw err; }
    if (rows[0].isPrivate === 0) {
      connection.query(`UPDATE Users SET isPrivate = 1 WHERE id = ${rows[0].id}`, (err) => {
        if (err) throw err;
        res.send({ success: true });
      })
    } else {
      connection.query(`UPDATE Users SET isPrivate = 0 WHERE id = ${rows[0].id}`, (err) => {
        if (err) throw err;
        res.send({ success: true });
      })
    }
    
  })
})

userRouter.post('/updateNotificate', ensureAuthenticated, (req, res) => {
  const { id } = req.body;
  connection.query(`SELECT * FROM Users WHERE id = ${id}`, (err, rows) => {
    if (err) { throw err; }
    if (rows[0].isNotificate === 0) {
      connection.query(`UPDATE Users SET isNotificate = 1 WHERE id = ${rows[0].id}`, (err) => {
        if (err) throw err;
        res.send({ success: true });
      })
    } else {
      connection.query(`UPDATE Users SET isNotificate = 0 WHERE id = ${rows[0].id}`, (err) => {
        if (err) throw err;
        res.send({ success: true });
      })
    }
    
  })
})

//This should include all posts.
userRouter.post('/delete', ensureAuthenticated, async (req, res) => {
  const { token, id, password } = req.body;
  
  connection.query(`SELECT * FROM Users WHERE id = ${id}`, (err, rows) => {
    if (err) { throw err; }
    else if (bcrypt.compareSync(password, rows[0].password) === false) {
      return res.send({success: false, msg: "Password does not match! Failed to delete account."})
    } else {
      if (rows[0].picture !== null ) {
        fs.unlink(`./public/images/${rows[0].picture}`, (err) => {
          if (err)
            throw err;
          console.log(`${rows[0].picture} was successfully deleted!`);
        })
      }
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
        } else {
          connection.query(`DELETE FROM Users WHERE id = ${id}`, (err) => {
            if (err) { throw err; }
            res.send({success: true });
          })
        }
      })
    }
  })
})


module.exports = userRouter;

// router.get('/', (req, res, next) => {
//   res.render('index', { title: 'Express' });
// });





// var express = require('express');
// var router = express.Router();

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   connection.query('SELECT * from members', function (error, results, fields) {
//     if (error) {
//       throw error;
//     }
//     res.send(JSON.stringify(results));
//   });
// })
