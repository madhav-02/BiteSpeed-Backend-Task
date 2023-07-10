import express from "express";
import * as dotenv from "dotenv";
import connection from "./mysql/connectDB.js";

dotenv.config();

const app = express();
const PORT = 8000;


// Middlewares
app.use(express.json());


try{
    connection.connect((error) => {
        if (error) {
          console.error('Failed to connect to the database: ', error);
          return;
        }
        console.log('Connected to the database!');
      });
    app.listen(PORT, ()=>{
        console.log(`Application has started at port ${PORT}`);
    })
}catch(err){
    console.log("THere was an error while starting the application: ",console.err);
}