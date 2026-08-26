const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteControllers");


router.post("/",noteController.createNote);
router.get("/owner",noteController.getMynotes);
router.get("/userNote/:id",noteController.getNoteById);
router.patch("/updatenote/:id",noteController.updateNote);
router.delete("/delete/:id",noteController.deleteNote);

module.exports = router;