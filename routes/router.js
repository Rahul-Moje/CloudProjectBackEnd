const express = require('express');
const router = express.Router();

const issueBookRoute = require("./issueBookRoute/issueBookRoute")
const testRoute = require("./testRoute/testRoute")

router.use("/", issueBookRoute);

router.use("/test", testRoute);

module.exports = router;