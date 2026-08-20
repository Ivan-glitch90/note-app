

const CURRENT_OWNER = "test@example.com";
const API_BASE = "/api/notes";

async function loadNotes(){
    try{
        const response = await fetch(API_BASE+"/owner/"+CURRENT_OWNER);
    if(!response.ok){
        return console.log("Something went wrong please try again later");
    }
    const data = await response.json();
    renderNotes(data);
    }catch(error){
        return console.error("Something went wrong try again later");
    }
};



function renderNotes(notes) { //notes is the parameter being send to this function; from loadNotes(data);
    const notesList = document.getElementById("notes-list");
    // is a reference to an existing empty spot on the page; the .map().join() chain builds real HTML out of your note data; and the final line writes that HTML into that spot, which is what makes it actually appear on screen.
   notesList.innerHTML = notes.map(note => ` 
        <div class="col-md-4">
            <div class="card note-card shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${note.title}</h5>
                    <span class="badge urgency-badge-${note.urgency}">Urgency: ${note.urgency}</span>
                    <p class="card-text mt-2">${note.content}</p>
                    <p class="text-muted small">${note.status}</p>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${note._id}">Delete</button>
                    <button class="btn btn-danger btn-sm edit-btn" data-id="${note._id}">Edit Note</button>
                    
                </div>

            </div>
        </div>
    `).join("");
};


document.getElementById("note-form").addEventListener("submit", async (event) => {
    event.preventDefault(); // stop the page from reloading — recall why from your weather app
    // 1. read each input's .value — title, content, urgency, status
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const urgency = Number(document.getElementById("urgency").value);
    const stats = document.getElementById("status").value;
    // 2. building an object matching what POST /api/notes expects: owner, title, content, urgency, status
   const newNote = {
    owner:CURRENT_OWNER,
    title:title,
    content:content,
    urgency:urgency,
    status:stats

   };
    // 3. fetch(API_BASE, { method: "POST", headers: {...}, body: JSON.stringify(...) })
   
    try{
    
    const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newNote)
});
     // 4. check response.ok
   if(!response.ok){   
    return console.error("Something went wrong please try again.");
    };
    // 5. if successful: clear the form, call loadNotes() again to refresh the list
   
   document.getElementById("note-form").reset();//<-- is this correct and more simple??
   loadNotes();
}catch(error){
    console.error("Something went wrong",error);

   };
    
});


//delete button:
document.getElementById("notes-list").addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
        try{
        const noteId = event.target.dataset.id;
        const response = await fetch(API_BASE+"/delete/"+noteId,{
            method:"DELETE"
        });
        if(!response.ok){
            return console.error("Something went wrong please try again later");
        }
        loadNotes();
        }catch(error){
            return console.error("Something went wrong try again later");
        };
    }
});

//edit button:
document.getElementById("notes-list").addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-btn")) {
        try {
            const noteId = event.target.dataset.id;
            //same fetch using existing get by id route
            const response = await fetch(API_BASE + "/usernote/" + noteId);
            if (!response.ok) {
                return console.log("Could not load that note. Please try again");
            }
            const note = await response.json();
            // 2. pre-fill the modal's fields with this note's real data
            document.getElementById("edit-id").value = note._id;
            document.getElementById("edit-title").value = note.title;
            document.getElementById("edit-content").value = note.content;
            document.getElementById("edit-urgency").value = note.urgency;
            document.getElementById("edit-status").value = note.status;
            // 3. actually open the modal
            const modal = new bootstrap.Modal(document.getElementById("editModal"));
            modal.show();
            


        } catch (error) {
            return console.error("Something went wrong please try again");
        }
    };
});


document.getElementById("edit-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
        // 1. read the hidden edit-id, plus all four editable fields' values:
        const noteId = document.getElementById("edit-id").value;
        const noteTitle = document.getElementById("edit-title").value;
        const noteContent = document.getElementById("edit-content").value;
        const noteUrgency = Number(document.getElementById("edit-urgency").value);
        const noteStatus = document.getElementById("edit-status").value;
        // 2. build an object with title, content, urgency (as a Number!), status
        const updatedNote={
            owner:CURRENT_OWNER,
             title:noteTitle,
            content:noteContent,
            urgency:noteUrgency,
            status:noteStatus
        };
        // 3. fetch(`${API_BASE}/updatenote/${noteId}`, { method: "PATCH", headers, body: JSON.stringify(...) })
       const response = await fetch(`${API_BASE}/updatenote/${noteId}`,{
        method:"PATCH",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify(updatedNote)
       });
        // 4. check response.ok
       if (!response.ok){
        return console.error("Something went wrong please try again");
        };
        // 5. if successful: hide the modal, call loadNotes() to refresh the list
        const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        modal.hide();
       loadNotes(); //calling loadnotes(); when hide is done


    } catch (error) {
        console.error("Something went wrong", error);
    }
});