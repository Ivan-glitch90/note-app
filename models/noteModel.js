const mongoose = require("mongoose");


const noteSchema = new mongoose.Schema({
   
    owner:{
        type:String,
        required:true
    },

    title:{ //title of the note itself
        type:String, required:true,trim:true
    },

    content:{ 

        type:String, required:true,

    },

    status:{ //read? not read?
        type:String
    },


    urgency:{//1 to 5
        type:Number, required:true
    },

    assigned:{ // assigned: for a future note-sharing feature, separate from owner
        type:String, required:false
    },


    

},{
    timestamps:true
    
});


module.exports=mongoose.model("Notes",noteSchema); //exporting the model so we can use it in

