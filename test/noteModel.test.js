const {expect} = require("chai");
const Notes = require("../models/noteModel");

/* apparently validSync() is deprecated; writing/ attempting the new standard. Leaving this as reference.
describe("Validation of note model",()=>{
    it("requires a title",()=>{
        const note = new Notes({
            owner:"test@example.com",
            content:"Example of content",
            urgency: 3
            //title is missing on purpose. this test should fail
        });
        const error = note.validateSync();
        expect(error.errors.title).to.exist;
    });

    it("All fields are present and correct",()=>{
        const note = new Notes({
            owner:"test@example.com",
            content:"Example of content",
            urgency: 5,
            title:"title is not missing"
        });
        const error = note.validateSync();
        expect(error).to.be.undefined;
    });

});
*/

it("requires a title", async () => {
    const note = new Notes({
        owner: "test@example.com",
        content: "Example of content",
        urgency: 3
    });

    try {
        await note.validate();
        throw new Error("Expected validation to fail, but it succeeded");
    } catch (error) {
        expect(error.errors.title).to.exist;
    }

    
});

//test#2

it("All fields are present and correct",async()=>{
    const note = new Notes({
        owner:"test@example.com",
        content:"Example of content",
        urgency:5,
        title:"Title not missing!!"
        
    });
    await note.validate();

});