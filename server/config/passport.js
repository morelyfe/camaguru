//config/passport.js
const bcrypt = require('bcryptjs');
//load all the things we need
const LocalStrategy = require('passport-local').Strategy;

//load up the user model
const connection = require('./databaseConfig');

//expose this function to our app using module.exports
module.exports = function(passport) {
    //passport session setup
    //required for persistent login sessions
    //passport needs ability to serialize and unserialize users out of session

    //used to serialize the user for the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    //used to deserialize the user
    passport.deserializeUser((id, done) => {
        connection.query("SELECT * from Users WHERE id = ? ", [id], (err, rows) => {
            done(err, rows[0]);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
        },
        function(username, password, done) {
            connection.query("SELECT * FROM Users WHERE email = ?", [username], function(err, rows) {
                if (err) { return done(err);}
                // test
                if (rows.length > 0) {
                    if (bcrypt.compareSync(password, rows[0].password) === false) {
                        return done(null, false, {message: 'Incorrect password'});
                    } else {
                        return done(null, rows[0]);
                    }
                }
                return done(null, false, {message: 'Incorrect username'});
            });
        }
    ));

};