const express = require('express');
const router = express.Router();

const issueBookRoute = require("./issueBookRoute/issueBookRoute")
const testRoute = require("./testRoute/testRoute")
const viewBooksRoute = require("./viewBooksRoute/viewBooksRoute")

router.use("/", issueBookRoute);

router.use("/test", testRoute);

router.use("/viewBooks", viewBooksRoute)

module.exports = router;