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

        await users.updateOne(
            { email: email },
            { $push: {
                user_deliverables: {
                    $each: deliverables
                }
            } }
        );
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

        await users.updateOne(
            { email: email },
            { $push: {
                todos: {
                    $each: todos
                }
            } }
        );
    }
    catch (err) {
        throw err;
    }
}

async function removeTodos(email, todos) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const users = db.collection("Users");

        console.log(todos);

        const todo_ids = todos.map((todo) => {
            // the tostring will be REMOVED once all ids are created on back end
            return ObjectId.createFromHexString(todo._id).toString();
        });

        await users.updateOne(
            { email: email },
            { $pull: {
                todos: {
                    _id: {
                        $in: todo_ids
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
    writeSpaces: writeSpaces,
    toggleSpaceDisplay: toggleSpaceDisplay
}
