const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const space = require("./space");

const dotenv = require("dotenv").config();
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);

async function getUser(email) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        const user = await users.findOne({
            email: email
        });

        return user;
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function registerUserStandard(first_name, last_name, email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        await users.insertOne({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: hashedPassword,
            todos: [],
            user_deliverables: [],
            user_spaces: [],
            is_google: false
        });

        return await getUser(email);
    }
    catch (err) {
        throw err;
    }
}

async function registerUserGoogle(first_name, last_name, email) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        await users.insertOne({
            first_name: first_name,
            last_name: last_name,
            email: email,
            password: null,
            todos: [],
            user_deliverables: [],
            user_spaces: [],
            is_google: true
        });

        return await getUser(email);
    }
    catch (err) {
        throw err;
    }
}

async function toggleSpaceDisplay(email, spaceId, shown) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        await users.updateOne(
            { 
                email: email, 
                "user_spaces._id": ObjectId.createFromHexString(spaceId) 
            },
            { 
                $set: { 
                    "user_spaces.$.shown": shown 
                } 
            }
        );
    }
    catch (err) {
        throw err;
    }
}

async function writeDeliverables(email, deliverables) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        deliverables = deliverables.map((deliverable) => {
            return {
                ...deliverable,
                _id: new ObjectId(),
            }
        })

        await users.updateOne(
            { email: email },
            { $push: {
                user_deliverables: {
                    $each: deliverables
                }
            } }
        );

        return deliverables;
    }
    catch (err) {
        throw err;
    }
}

async function writeTodos(email, todos) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        console.log("todos:", todos);

        todos = todos.map((todo) => {
            return {
                ...todo,
                deliverable: todo.deliverable ? ObjectId.createFromHexString(todo.deliverable) : null,
                _id: new ObjectId(),
            }
        });

        await users.updateOne(
            { email: email },
            { $push: {
                todos: {
                    $each: todos
                }
            } }
        );

        return todos;
    }
    catch (err) {
        throw err;
    }
}

async function removeTodos(email, todo_ids) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        console.log("removing: ", todo_ids);

        const ids = todo_ids.map((todo_id) => {
            return ObjectId.createFromHexString(todo_id);
        });

        await users.updateOne(
            { email: email },
            { $pull: {
                todos: {
                    _id: {
                        $in: ids
                    }
                }
            } }
        );
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

async function editTodo(email, todo) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        console.log("editing todo: ", todo);

        await users.updateOne(
            { email: email, "todos._id": ObjectId.createFromHexString(todo._id) },
            { $set: {
                "todos.$.title": todo.title,
                "todos.$.description": todo.description,
                "todos.$.start_time": todo.start_time,
                "todos.$.end_time": todo.end_time,
                "todos.$.deliverable": todo.deliverable
            } }
        );
    }
    catch (err) {
        throw err;
    }
}

async function writeSpaces(email, spaces) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        await users.updateOne(
            { email: email },
            { $push: {
                user_spaces: {
                    $each: spaces
                }
            } }
        );

        console.log("it")
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
    getUser: getUser,
    registerUserStandard: registerUserStandard,
    registerUserGoogle: registerUserGoogle,
    writeDeliverables: writeDeliverables,
    writeTodos: writeTodos,
    removeTodos: removeTodos,
    editTodo: editTodo,
    writeSpaces: writeSpaces,
    toggleSpaceDisplay: toggleSpaceDisplay
}
