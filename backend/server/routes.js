const connectDB = require("./db");

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const user = require("./user.js");
const space = require("./space.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

app.post("/auth/standard-sign-up", async (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        const fetchedUser = await user.getUser(email);
        if (fetchedUser !== null) {
            return res.status(409).json({ message: "User already exists."});
        }

        const newUser = await user.registerUserStandard(
            first_name, last_name, email, password
        );

        return res.status(200).json({ 
            message: "Successfully registered new user!", 
        });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
})

app.post("/auth/google-sign-up", async (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;

    try {
        const fetchedUser = await user.getUser(email);
        if (fetchedUser !== null) {
            return res.status(409).json({
                message: "A user with this email already exists."
            });
        }

        const newUser = await user.registerUserGoogle(
            first_name, last_name, email
        );

        return res.status(200).json({ 
            message: "Successfully registered new user!", 
        });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
})

app.post("/auth/standard-login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const fetchedUser = await user.getUser(email);
        if (fetchedUser === null) {
            return res.status(409).json({
                message: "A user with this email doesn't exist."
            });
        }

        if (fetchedUser.is_google) {
            return res.status(400).json({
                message: "This email is registered with Google."
            })
        }
        
        const auth = await bcrypt.compare(password, fetchedUser.password);
        if (!auth) {
            return res.status(409).json({ message: "Incorrect password."});
        }

        return res.status(200).json({
            message: "Successfully logged in!",
        });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ error: err });
    }
})

app.post("/auth/google-login", async (req, res) => {
    const email = req.body.email;
    try {
        const fetchedUser = await user.getUser(email);
        if (fetchedUser === null) {
            return res.status(409).json({
                message: "A user with this email doesn't exist."
            });
        }

        if (!fetchedUser.is_google) {
            return res.status(400).json({
                message: "This email is not registered with Google."
            });
        }

        if (fetchedUser.email !== email) {
            return res.status(409).json({
                message: "This email is not registered with Google."
            });
        }

        return res.status(200).json({
            message: "Successfully logged in!",
        });
    }
    catch (err) {
        return res.status(400).json({ error: err });
    }
})

app.post("/user/info", async (req, res) => {
    const email = req.body.email;
    try {
        const fetchedUser = await user.getUser(email);
        if (fetchedUser === null) {
            return res.status(404).json({
                message: "Failed to get info."
            })
        }

        return res.status(200).json({
            message: "Successfully got user data.",
            user: fetchedUser
        });
    }
    catch (err) {
        return res.status(400).json({
            message: "Failed to get info"
        });
    }
})

app.post("/space/info", async (req, res) => {
    const spaceId = req.body.space_id;
    console.log("id:", spaceId);
    try {
        const fetchedSpace = await space.getSpace(spaceId);
        if (fetchedSpace === null) {
            return res.status(404).send({
                error: "Space not found. Invalid id."
            });
        }
        return res.send(fetchedSpace);
    }
    catch (err) {
        console.error(err);
        return res.status(404).send({ error: err });
    }
})

app.post("/space/access", async (req, res) => {
    const access_code = req.body.access_code;
    try {
        const fetchedSpace = await space.getSpace(access_code);
        if (fetchedSpace === null) {
            return res.status(404).send({
                error: "Space not found. Invalid access code."
            });
        }
        return res.send(fetchedSpace);
    }
    catch (err) {
        console.error(err);
        return res.status(404).send({ error: err });
    }
})

app.put("/user/write-todo", async (req, res) => {
    const email = req.body.email;
    const newTodo = req.body.new_todo;

    try {
        const newTodoWithId = await user.writeTodo(email, newTodo);
        
        return res.status(200).json({
            message: "Successfully updated todo.",
            new_todo_with_id: newTodoWithId
        });
    }
    catch (err) {
        console.error(err);
        return res.status(400).json({ message: "Failed to update todo." })
    }
})

app.put("/user/remove-todo", async (req, res) => {
    const email = req.body.email;
    const removedTodoId = req.body.removed_todo_id;

    try {
        await user.removeTodo(email, removedTodoId);
        
        return res.status(200).json({
            message: "Successfully removed todo."
        });
    }
    catch (err) {
        return res.status(400).json({ message: "Failed to update todo." })
    }
})

app.put("/user/edit-todo", async (req, res) => {
    const email = req.body.email;
    const todo = req.body.todo;

    try {
        await user.editTodo(email, todo);
        
        return res.status(200).json({
            message: "Successfully edited todo."
        });
    }
    catch (err) {
        return res.status(400).json({ message: "Failed to edit todo." })
    }
})

app.put("/user/write-deliverable", async (req, res) => {
    const email = req.body.email;
    const newDeliverable = req.body.new_deliverable;

    try {
        const newDeliverableWithId = await user.writeDeliverable(
            email, newDeliverable
        );
        
        return res.status(200).json({
            message: "Successfully updated user deliverable.",
            new_deliverable_with_id: newDeliverableWithId
        });
    }
    catch (err) {
        return res.status(400).json({
            message: "Failed to update deliverable."
        })
    }
})

// app.put("/user/toggle-space-display", async (req, res) => {
//     const email = req.body.email;
//     const spaceId = req.body.spaceId;
//     const shown = req.body.shown;

//     try {
//         await user.toggleSpaceDisplay(email, spaceId, shown);

//         return res.status(200).json({
//             message: "Successfully updated space display setting."
//         });
//     }
//     catch (err) {
//         return res.status(400).json({
//             message: "Failed to update space display setting."
//         })
//     }
// })

// app.put("/user/update-spaces", async (req, res) => {
//     const email = req.body.email;
//     const newSpaces = req.body.new_spaces;
//     try {
//         await user.writeSpaces(email, newSpaces, shown);

//         return res.status(200).json({
//             message: "Successfully updated user spaces."
//         });
//     }
//     catch (err) {
//         return res.status(400).json({ message: "Update failed." })
//     }
// })

// app.put("/space/update-people", async (req, res) => {
//     const spaceId = req.body.spaceId;
//     const newPeople = req.body.new_people;

//     console.log("request: ", spaceId, newPeople);

//     try {
//         await space.writePeople(spaceId, newPeople);

//         return res.status(200).json({
//             message: "Successfully updated space roster."
//         });
//     }
//     catch (err) {
//         return res.status(400).json({ message: "Update failed." })
//     }
// })

// app.put("/space/update-deliverables", (req, res) => {
//     const newDeliverables = req.body.new_deliverables;
// })

app.listen(8000, () => {
    console.log("Server Started on Port", 8000);
});