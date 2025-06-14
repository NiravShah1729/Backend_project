import dotenv from "dotenv";
dotenv.config({
    path: './env'
});
import connectDB from "./db/index.js";
import app from "./app.js";


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
});







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