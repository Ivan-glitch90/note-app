const { expect } = require("chai");
const sinon = require("sinon");
const Notes = require("../models/noteModel");
const noteController = require("../controllers/noteControllers");

describe("createNote controller", () => {

    afterEach(() => {
        sinon.restore(); // undo all stubs after each test, so they don't leak into the next one
    });

    it("creates a note and responds with 201", async () => {
        const fakeNote = { _id: "abc123", title: "Buy milk", content: "2%", urgency: 3 };

        // 1. stub Notes.create so it doesn't touch the real database,
        //    and make it resolve with fakeNote instead
        sinon.stub(Notes, "create").resolves(fakeNote);

        const req = {
            body: { title: "Buy milk", content: "2%", urgency: 3, status: "unread" },
            user: { emails: [{ value:"test@example.com"}]}
        };

        const res = {
            status: sinon.stub().returnsThis(), // returnsThis() lets .status(201).json(...) chain correctly
            json: sinon.stub()
        };

        await noteController.createNote(req, res);

        expect(res.status.calledWith(201)).to.be.true;
        expect(res.json.calledWith(fakeNote)).to.be.true;
    });


    it("responds with 400 when title is missing", async()=>{
        const req = {
            body: { title: "", content: "2%", urgency: 3, status: "unread" },
            user: { emails: [{ value:"test@example.com"}]}
        };

        const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub()
    };

    await noteController.createNote(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: "Title is required." })).to.be.true;
    });

    


    

});


describe("deleteNote controller", () => {

    afterEach(() => {
        sinon.restore();
    });

    it("deletes a note and responds with 200", async () => {
        const fakeDeletedNote = { _id: "abc123", owner: "test@example.com", title: "Buy milk" };

        sinon.stub(Notes, "findOneAndDelete").resolves(fakeDeletedNote);

        const req = {
            params: { id: "abc123" },
            user: { emails: [{ value: "test@example.com" }] }
        };

        const res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };

        await noteController.deleteNote(req, res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({ message: "Note erased", deleteNote: fakeDeletedNote })).to.be.true;
    });

        it("responds with 404 when the note doesn't belong to this user (or doesn't exist)", async () => {
        sinon.stub(Notes, "findOneAndDelete").resolves(null);//null is what moongose sends back when a query finds nothing

        const req = {
            params: { id: "someone-elses-note-id" },
            user: { emails: [{ value: "test@example.com" }] }
        };

        const res = {
            status: sinon.stub().returnsThis(),
            send: sinon.stub() // note: this controller uses .send() for the 404, not .json()
        };

        await noteController.deleteNote(req, res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.send.calledWith("No notes found")).to.be.true;
    });

});

//success case:
describe("updateNote controller",()=>{
    afterEach(()=>{
        sinon.restore();
    });

    it("Updates a note",async()=>{
        const fakeupdateNote = {_id:"abc124",owner:"test@example.com",title:"buy milk",urgency:4};
        sinon.stub(Notes,"findByIdAndUpdate").resolves(fakeupdateNote);

        const req = {
            params:{id:"abc124"},
            user:{emails:[{value:"test@example.com"}]}
        };

        const res ={
            status:sinon.stub().returnsThis(),
            json:sinon.stub()
        };

        await noteController.updateNote(req,res);

        expect(res.status.calledWith(200)).to.be.true;
        expect(res.json.calledWith({message:"Note updated",updatedNote:fakeupdateNote})).to.be.true;//returning the new note if success; 
    });
//notFound Case:
    it("Returns a 404; when a note is not found or the note does not belong to the user",async()=>{

        sinon.stub(Notes,"findByIdAndUpdate").resolves(null); 

        const req={
            params:{id:"Invalid ID!"},
            user:{emails:[{value:"test@badtest.com"}]}
        };

        const res={
            status:sinon.stub().returnsThis(),
            send:sinon.stub() //this controller also uses .send
        };

        await noteController.updateNote(req,res);

        expect(res.status.calledWith(404)).to.be.true;
        expect(res.send.calledWith("Cannot find a note with that id. Check id")).to.be.true;
    });

});