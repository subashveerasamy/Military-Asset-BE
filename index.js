import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Database/dbConfig.js'
import userRoutes from './Routers/users.router.js'
import baseRoutes from './Routers/BaseData.router.js'

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.status(200).send("Welcome to Aura Force")
});
app.use("/user", userRoutes);
app.use("/base", baseRoutes);
connectDB();

app.listen(process.env.port, ()=>{
    console.log(`server is running on port ${process.env.port}`)
})