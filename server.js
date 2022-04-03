const express = require("express");
const cors = require("cors");
const routes = require("./routes/router")
const bodyParser = require('body-parser');
const port = process.env.PORT || "80";

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


