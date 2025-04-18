const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const user = require("./user.js");
const space = require("./space.js");

app.use(cors());
app.use(bodyParser.json());

app.get("/testConnection", async (req, res) => {
    try {
        const comment = await user.testConnection();
        console.log(comment);
        res.send(`${comment.name}`)
    }
    catch (err) {
        console.error(err);
    }
});

app.post("/get-user", async (req, res) => {
    const email = req.body.email;
    try {
        const fetchedUser = await user.getUser(email);
        res.send(fetchedUser);
    }
    catch (err) {
        console.error(err);
    }
})

app.post("/get-space", async (req, res) => {
    const spaceName = req.body.space_name;
    try {
        const fetchedSpace = await space.getSpace(spaceName);
        res.send(fetchedSpace);
    }
    catch (err) {
        console.error(err);
    }
})

app.listen(8000, () => {
    console.log("Server Started on Port", 8000);
});