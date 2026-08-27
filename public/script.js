//const CURRENT_OWNER = "test@example.com"; this was a placeholder; removing this to use real authentication; 
const API_BASE = "/api/notes";

async function loadNotes(){
    try{
        const response = await fetch(API_BASE+"/owner"); //old version -> const response = await fetch(API_BASE+"/owner/"+CURRENT_OWNER);
    if(!response.ok){
        console.log("Something went wrong please try again later");
        return showAlert("Could not load notes. Please try again","danger");
    }
    const data = await response.json();
    renderNotes(data);
    }catch(error){
        console.log("Something went wrong please try again later");
        return showAlert("Something is broken x_x. Please try again","danger");
    }
};


async function loadAuthStatus() {
    const authSection = document.getElementById("auth-section");

    try {
        const response = await fetch("/api/me");

        if (!response.ok) {
            console.error("Could not check login status.");
            return showAlert("Could not load status. Try again","danger");
        }

        const data = await response.json();

        if (data.loggedIn) {
            authSection.innerHTML = `
                <span class="text-white me-3">${data.email}</span>
                <a href="/logout" class="btn btn-outline-light btn-sm">Logout</a>
            `;
        } else {
            authSection.innerHTML = `
                <a href="/auth/google" class="btn btn-outline-light btn-sm">Sign in with Google</a>
            `;
        }

    } catch (error) {
        console.error("Something went wrong checking login status", error);
        return showAlert("Could not load status. Try again","danger");
    }
}


function renderNotes(notes) { //notes is the parameter being send to this function; from loadNotes(data);
    const notesList = document.getElementById("notes-list");
    if(notes.length === 0){
        return notesList.innerHTML =  `<p class="text-muted"> You don't have any notes.</p>`
    }
    // is a reference to an existing empty spot on the page; the .map().join() chain builds real HTML out of note data; and the final line writes that HTML into that spot, which is what makes it actually appear on screen.
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
    event.preventDefault(); // stop the page from reloading — similar to weather app
    // 1. read each input's .value — title, content, urgency, status
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const urgency = Number(document.getElementById("urgency").value);
    const stats = document.getElementById("status").value;
    // 2. building an object matching what POST /api/notes expects: owner, title, content, urgency, status
   const newNote = {
    //owner:CURRENT_OWNER, //using real email with AUth
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
     console.error("Could not add note.");//keeping this for debugging just in case
    return showAlert("Note couldn't be addded","danger")
   
    };
    // 5. if successful: show alert, clear the form, call loadNotes() again to refresh the list
   showAlert("New note created!");
   document.getElementById("note-form").reset();//<-- is this correct and more simple??
   loadNotes();
}catch(error){
    console.error("Something went wrong",error);
    return showAlert("The server is not responding please try again");
   };
    
});


//delete button:
document.getElementById("notes-list").addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
        try{
        const noteId = event.target.dataset.id;
        const maybe = window.confirm("Are you sure you want to delete this note?")
        if(!maybe){
            return //not saying anything here just stoping the function if user clicks cancel
        }
        const response = await fetch(API_BASE+"/delete/"+noteId,{
            method:"DELETE"
        });
        if(!response.ok){
            console.error("Could not erase the note");
            return showAlert("Could not erase the note. Please try again", "danger");
        }
        showAlert("Note erased!","warning");
        loadNotes();
        }catch(error){
            console.error("Something went wrong try again later");
            return showAlert("The server is not responding please try again");
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
                console.log("Could not open this note");
                return showAlert("Could not open this note, please try again","danger");
                
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
            console.error("Something went wrong please try again");
            return showAlert("The server is not responding please try again");
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
           // owner:CURRENT_OWNER,
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
        console.error("Could not edit the note");
        return showAlert("Could not edit. Please try again","danger");
        };
        // 5. if successful: hide the modal, call loadNotes() to refresh the list
        const modal = bootstrap.Modal.getInstance(document.getElementById("editModal"));
        modal.hide();
        showAlert("Note edited!");
        loadNotes(); //calling loadnotes(); when hide is done
        

    } catch (error) {
        console.error("Something went wrong", error);
        return showAlert("The server is not responding please try again");
    }
});

document.getElementById("refresh-btn").addEventListener("click", () => {
    loadNotes();
});

//showing alerts:
function showAlert(message, type = "success") {
    const placeholder = document.getElementById("alert-placeholder");
    placeholder.innerHTML = `
        <div class="alert alert-${type} alert-dismissible" role="alert">
            <div>${message}</div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}

loadAuthStatus();