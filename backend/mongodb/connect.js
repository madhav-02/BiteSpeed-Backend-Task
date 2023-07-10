import mongoose, { mongo } from "mongoose";

const connectDB = (url) => {
    mongoose.set('strictQuery',true);  // Means if fields that is not defined in the schema of an object is passed by mistake while creating an object of that schema, it will be ignored.

    mongoose.connect(url)
    .then(()=>{console.log("Mongo DB Connected");})
    .catch(()=>{console.log("Error connecting to MongoDB");})
}

export default connectDB;