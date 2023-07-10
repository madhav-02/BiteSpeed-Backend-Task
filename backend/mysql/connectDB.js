import mysql from 'mysql2';
import * as dotenv from "dotenv";
dotenv.config();
console.log("DATABASE is : ",process.env.MYSQL_DATABASE);
const connection = mysql.createConnection({
    
    host: process.env.MYSQL_HOST, // Replace with your database host
    user: process.env.MYSQL_USERNAME, // Replace with your database username
    password: process.env.MYSQL_PASSWORD, // Replace with your database password
    database: process.env.MYSQL_DATABASE // Replace with your database name
  });

  export default connection;