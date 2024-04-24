const mysql = require('mysql')

//creating connection to database
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"megg-website"
})

module.exports = db;