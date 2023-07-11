import express from "express";
import * as dotenv from "dotenv";
import connection from "./mysql/connectDB.js";
import contactRoutes from './routes/contactRoutes.js';
dotenv.config();

const app = express();
const PORT = 8000;


// Middlewares
app.use(express.json());
app.use('/api/v1/contact', contactRoutes);

try{
    app.listen(PORT, ()=>{
        console.log(`Application has started at port ${PORT}`);
    });
}catch(err){
    console.log("THere was an error while starting the application: ",err);
}