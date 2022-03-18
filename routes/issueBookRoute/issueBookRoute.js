const express = require("express");
const router = express.Router();
const issueBookController = require("../../controllers/issueBookController/issueBookController");


router.get("/getBookByID/:id", issueBookController.getBookByID);
router.post("/issueBook1", issueBookController.issueBook);
router.post("/publishText", issueBookController.publishText);
router.post("/createTopic", issueBookController.createTopic);
router.post("/subscribe", issueBookController.subscribe);
router.post("/publishEmail", issueBookController.publishEmail);


module.exports = router;
