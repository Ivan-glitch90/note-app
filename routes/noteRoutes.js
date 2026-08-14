const express = require("express");
const router = express.Router();
const Notes = require("../models/noteModel");






router.post("/", async (req, res) => {
    const { owner, title, content, urgency } = req.body;
    
    if (!owner) {
        return res.status(400).json({ error: "Owner is required." });
    }
    if (!title) {
        return res.status(400).json({ error: "Title is required." });
    }
    if (!content) {
        return res.status(400).json({ error: "Content is required." });
    }
    if (!urgency) {
        return res.status(400).json({ error: "Urgency is required." });
    }
    
    try{
          const newNote = await Notes.create(req.body);
            res.status(201).json(newNote);
          
    
    }catch(error){
        res.status(500).send("Something went wrong please try again.")
    }
  
});

router.get("/owner/:owner", async (req,res)=>{
    const noteOwner = await Notes.find({owner:req.params.owner});
    res.json(noteOwner);
});



module.exports = router;