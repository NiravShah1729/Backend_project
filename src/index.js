import dotenv from "dotenv";
dotenv.config({
    path: './env'
});
import connectDB from "./db/index.js";



connectDB()







// import express from "express";
// const app = express();


// ( async () => {
//     try{
//         await mongoose.connext(`${process.env.MONGODM_URL}/${DB_NAME}`)
//         app.on("error", (err) => {
//             console.error("Express server error:", err);
//             throw err;
//         });

//         app.listen(process.env.PORT ,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     }catch(error){
//         console.error("Error connecting to MongoDB:", error);
//         throw error;
//     }
// })()