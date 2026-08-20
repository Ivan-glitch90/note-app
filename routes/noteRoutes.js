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

    try {
        const newNote = await Notes.create(req.body);
        res.status(201).json(newNote);


    } catch (error) {
        res.status(500).send("Something went wrong please try again.");
    }

});
//validation on "/owner/:owner" will check for: 
//2. if no notes for that owner return a message
//3. if database is unresponsive display a message instead of crashing the server.




router.get("/owner/:owner", async (req, res) => {
    try {
        const noteOwner = await Notes.find({ owner: req.params.owner });
        if (noteOwner.length === 0) {
            return res.status(404).json("No notes found for this person");
        }
        res.json(noteOwner);

    } catch (error) {
        console.error(error);
        return res.status(500).send("The server is unavailable. Please try again.")
            ;
    }

});

//validation on "/userNote/:id" will check for server issues and that notes exist
router.get("/userNote/:id", async (req, res) => {

    try {
        const noteUser = await Notes.findById(req.params.id);
        if (!noteUser) {
            return res.status(404).send("No notes found with that ID");
        }
        res.json(noteUser);
    } catch (error) {
        console.error(error);
        return res.status(500).send("The server is unavailable. Please try again.");
    };

});


//using patch to find a note by its id and then mod it.
router.patch("/updatenote/:id",async(req,res)=>{
    try{
        const updatedNote = await Notes.findByIdAndUpdate(
            req.params.id, //telling what document to find - we can use raw "id" no need of "_id"
            req.body, //what to change to that document.
            {new:true} // return updated document; without this would return old doc.
        );
        if(!updatedNote){
            return res.status(404).send("Cannot find a note with that id. Check id");
        }
        res.json(updatedNote);
    }catch(error){
        console.error(error);
        return res.status(500).send("The server is unavailable. Please try again.");
    };
});


router.delete("/delete/:id",async(req,res)=>{
    try{
        const deleteNote = await Notes.findByIdAndDelete(req.params.id);
        if(!deleteNote){
            return res.status(404).send("No notes found");
        }
        res.status(200).json({message:"Note erased",deleteNote});
    }
    catch(error){
        console.error(error);
        return res.status(500).send("Error deleting the document, please try again");
    }
});


module.exports = router;
