const express = require('express');
// const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
// const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const MySQLStore = require('express-mysql-session')(session);
// const connection = require('./config/databaseConfig');

// passport config
require('./config/passport')(passport);

const app = express();

app.use(bodyParser.json({limit: '10mb'}));
app.use(cors());
app.use(morgan('dev'));
//EJS
// app.use(expressLayouts);
// app.set('view engine', 'ejs');
app.use(express.static('./public'));

//Bodyparser
app.use(express.urlencoded({ limit: '10mb', extended : false }));

const options = {
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database : process.env.RDS_DATABASE,
};

var sessionStore = new MySQLStore(options);

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    store: sessionStore,
    saveUninitialized: true
} ));
//passport should be after the express-session middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
// app.use(flash());

// //Global Vars custom middleware
// app.use((req, res, next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     res.locals.error = req.flash('error');
//     next();
// })


// Routes
// const apiRouter = require('./api/api.js');

// app.use('/api', apiRouter);

app.use('/', require('./api/index'));
app.use('/users', require('./api/users'));
app.use('/auth', require('./api/auth'));
app.use('/posts', require('./api/posts'));
app.use('/sticker', require('./api/sticker'));
app.use('/search', require('./api/search'));
app.use('/likes', require('./api/likes'));
app.use('/comments', require('./api/comments'));
app.use('/notification', require('./api/notification'));


// app.use('/model', require('./models/model'));
// app.use('/setup', require('./config/setup'));

app.use(errorhandler());

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});