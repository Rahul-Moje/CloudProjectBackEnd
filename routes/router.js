const express = require('express');
const router = express.Router();

const issueBookRoute = require("./issueBookRoute/issueBookRoute")

router.use("/issueBook", issueBookRoute);

module.exports = router;