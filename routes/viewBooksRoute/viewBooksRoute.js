const express = require("express")
const router = express.Router();
const viewBooksController = require("../../controllers/viewBooksController/viewBooksController")

router.get("/", viewBooksController.getBooksData);

module.exports = router