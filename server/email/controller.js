const sendEmail = require('./send');
const msgs = require('./msgs');
const templates = require('./templates');
const bcrypt = require('bcryptjs');
const uuid = require('uuid/v4');

const connection = require('../config/databaseConfig');
// nodemailer
exports.collectEmail = (req, res) => {
    const { email } = req.body;

    connection.query(`SELECT * FROM Users WHERE email = '${email}'`, (err, rows) => {
      if (err) throw err;
      else if (rows.length > 0 && !rows[0].confirmed) {
        sendEmail(rows[0].email, templates.confirm(rows[0].id, rows[0].email))
        .then(() => res.send({ msg: msgs.confirm }))
        .catch(err => console.log(err))
      }
      else if(rows[0].confirmed) {
        res.send({ msg: msgs.alreadyConfirmed })
      } else {
        res.send({ msg: msgs.emailerror });
      }
    })
}

exports.confirmEmail = (req, res) => {
  const { id, email } = req.params;
  
  connection.query(`SELECT * FROM Users WHERE id = ${id}`, (err, rows) => {
    if (err) throw err;
    else if (!rows.length) {
      res.send({ msg: msgs.couldNotFound })
    }
    else if (rows.length > 0 && !rows[0].confirmed){
      if (rows[0].email == email){
        connection.query(`UPDATE Users SET confirmed = 1 WHERE id = ${rows[0].id}`, (err, row) => {
          if (err) throw err;
          res.send({ msg: msgs.confirmed })
        })
      } else {
        res.send({ msg: msgs.emailerror})
      }
    }
    else if(rows[0].confirmed) {
      res.send({ msg: msgs.alreadyConfirmed })
    } else {
      res.send({ msg: msgs.emailerror });
    }
  })
}

exports.forgotEmail = (req, res) => {
  const { email } = req.body;

  connection.query(`SELECT * FROM Users WHERE email = '${email}'`, (err, rows) => {
    if (err) { throw err; } 
    else if (!rows.length) { return res.send({ success: false, msg:msgs.couldNotFound }) }
    else {
      const change = uuid();
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(change, salt, (err, hash) => {
          if (err) throw err;
          connection.query(`UPDATE Users SET password = '${hash}' WHERE email = '${rows[0].email}'`, (err) => {
            if (err) throw err;
            sendEmail(rows[0].email, templates.passReset(change))
            .then(() => res.send({ success: true, msg:msgs.emailReset }))
            .catch(err => console.log(err))
          })
        })
      })
    }

  })
}