import express from "express";
import * as dotenv from "dotenv";
import connectDB from "./mongodb/connect.js";

dotenv.config();

const app = express();
const PORT = 8000;


// Middlewares
app.use(express.json());


try{
    connectDB(process.env.MONGO_DB_URL);
    app.listen(PORT, ()=>{
        console.log(`Application has started at port ${PORT}`);
    })
}catch(err){
    console.log("THere was an error while connecting to mongoDB: ",console.err);
}