import mongoose from 'mongoose';

// PASTE YOUR EXACT LONG-FORM URL HERE (with your real db username and password)
const uri = "mongodb://<username>:<password>@ac-zxmhoav-shard-00-00.gmovaro.mongodb.net:27017,ac-zxmhoav-shard-00-01.gmovaro.mongodb.net:27017,ac-zxmhoav-shard-00-02.gmovaro.mongodb.net:27017/connect-music?ssl=true&replicaSet=atlas-zxmhoav-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log("Attempting to connect...");

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS! The database is connected.");
        process.exit(0);
    })
    .catch((err) => {
        console.log("FAILED:", err.message);
        process.exit(1);
    });