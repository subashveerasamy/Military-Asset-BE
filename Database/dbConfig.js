import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();


const connectDB= async()=>{
    try {
        await mongoose.connect(process.env.connectionString);
        console.log("Connected to mongoDB");
    } catch (error) {
        console.log("Error connecting to MongoDB", error)
    }
}


export default connectDB;