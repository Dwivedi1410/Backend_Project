import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {

    app.on("error", (error) => {
        console.log("ERROR :", error);
        throw error;
    })

    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () => {
        console.log(`App is listening on PORT : ${PORT}`);
    })
})
.catch((error) => {
    console.log("MONGODB CONNECTION FAILED !!", error);
})
//because connectDB is an asynchrous method so it will return a promise. => and to gracefully handle the promise we will use then and catch




























/*
import express from "express";
const app = express();

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("ERR: ", error)
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
        
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
})()
*/