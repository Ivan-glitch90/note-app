require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 3000;
const noteRoutes = require("./routes/noteRoutes");
app.use(express.json());
app.use("/api/notes", noteRoutes); //routes will be -> /..... because this: gets added later /api/notes


app.use(express.static("public"));//handling static files



mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(port,()=>{
        console.log("Connected to server");
    });
})
.catch((err)=>{
    console.error("Failed to connect to MongoDB:", err);
});



