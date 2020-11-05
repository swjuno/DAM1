var mysql = require('mysql');
var connection = mysql.createConnection({
    host : 'localhost',
    user : ' root',
    password : '111111',
    database : 'DAM'
})

connection.connect();

connection.query('SELECT 1+ 1 AS solution', function (error, results, fields) {
    if (error) {
        throw error;
    }
    console.log(results);
    })

connection.end();