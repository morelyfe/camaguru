const mysql = require('mysql');

require("dotenv").config();

// Create connection

const connection = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME,
  user     : process.env.RDS_USERNAME,
  password : process.env.RDS_PASSWORD,
  port     : process.env.RDS_PORT,
  database : process.env.RDS_DATABASE,
  multipleStatements: true
});
connection.connect((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
  }
  console.log('connected successfully to DB.');
});
// connection.query('USE ' + process.env.RDS_DATABASE);

module.exports = connection;

// module.exports = {
//   'connection': {
//     host     : process.env.RDS_HOSTNAME,
//     user     : process.env.RDS_USERNAME,
//     password : process.env.RDS_PASSWORD,
//     port     : process.env.RDS_PORT,
//   },
//   database : process.env.RDS_DATABASE
// };

// const db = mysql.createConnection({
//     host     : process.env.RDS_HOSTNAME,
//     user     : process.env.RDS_USERNAME,
//     password : process.env.RDS_PASSWORD,
//     port     : process.env.RDS_PORT
// });


// // Connect
// db.connect(function(err) {
//     if (err) {
//       console.error('Database connection failed: ' + err.stack);
//       return;
//     }
  
//     console.log('Connected to database.');
//   });

//   module.exports = db;
  