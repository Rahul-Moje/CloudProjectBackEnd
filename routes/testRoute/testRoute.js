const express = require("express")
const router = express.Router();
const testController = require("../../controllers/testController/testController")

router.get("/", testController.generateTestData);

module.exports = router