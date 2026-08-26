const Notes = require("../models/noteModel");

exports.createNote = async (req, res) => {
    const { title, content, urgency, status } = req.body;
    const owner = req.user.emails[0].value;

    if (!owner) return res.status(400).json({ error: "Owner is required." });
    if (!title) return res.status(400).json({ error: "Title is required." });
    if (!content) return res.status(400).json({ error: "Content is required." });
    if (!urgency) return res.status(400).json({ error: "Urgency is required." });

    try {
        const newNote = await Notes.create({ owner, title, content, urgency, status });
        res.status(201).json(newNote);
    } catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong please try again.");
    }
};


//validation on "/owner/:owner" will check for: 
//2. if no notes for that owner return a message
//3. if database is unresponsive display a message instead of crashing the server.

exports.getMynotes = async(req,res)=>{//removing :owner to remove it from the URL :owner is not needed because the route is protected/validated by requireLogin. so we know who's notes we are fetching old route: router.get("/owner/:owner", async (req, res)
    try {
        const noteOwner = await Notes.find({ owner: req.user.emails[0].value });
        
        res.json(noteOwner);

    } catch (error) {
        console.error(error);
        return res.status(500).send("The server is unavailable. Please try again.")
            ;
    }

};
//validation on "/userNote/:id" will check for server issues and that notes exist
exports.getNoteById = async (req,res)=>{
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
};

//using patch to find a note by its id and then mod it.
exports.updateNote = async(req,res)=>{
    const owner = req.user.emails[0].value;
    try{
        const updatedNote = await Notes.findByIdAndUpdate(
            req.params.id, //telling what document to find - we can use raw "id" no need of "_id" - spread the client's other fields, but force owner to the real logged-in user
            {...req.body,owner}, //what to change to that document.
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
};
//delete note checking that the user is owner of the note to avoid them from potentially erasing other notes that dont belong to them
exports.deleteNote = async(req,res)=>{
   try{
        const deleteNote = await Notes.findOneAndDelete({owner:req.user.emails[0].value,
            _id:req.params.id});
        if(!deleteNote){
            return res.status(404).send("No notes found");
        }
        res.status(200).json({message:"Note erased",deleteNote});
    }
    catch(error){
        console.error(error);
        return res.status(500).send("Error deleting the document, please try again");
    } 
};