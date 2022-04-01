const express = require('express');
const router = express.Router();

const issueBookRoute = require("./issueBookRoute/issueBookRoute")

router.use("/", issueBookRoute);

module.exports = router;