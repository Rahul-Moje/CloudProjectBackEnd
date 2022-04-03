const express = require("express");
const cors = require("cors");
const routes = require("./routes/router")
const bodyParser = require('body-parser');
<<<<<<< HEAD
const port = process.env.PORT || "8080";
const test = require("./routes/testRoute/testRoute")
=======
const port = process.env.PORT || "5000";
>>>>>>> 265d52f63d8fd2ff304c80832045f8441537db61

const app = express();
const options = {
    allowedHeaders: ["Origin", "Content-Type", "Accept", "Authorization"],
    origin: "*",
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
};


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true, parameterLimit: 50000 }));
app.use(cors(options));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/bookaholic/api', routes);

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
})


