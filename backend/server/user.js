const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv").config();
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);

async function testConnection() {
    try {
        await client.connect();

        console.log("Connected successfully");
        const db = client.db("sample_mflix");

        const collection = db.collection("comments");

        const comment = await collection.findOne({
            name: "John Bishop"
        });

        return comment;
    }
    catch (err) {
        return err;
    }
    finally {
        // await client.close();
    }
}

async function getUser(email) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const collection = db.collection("Users");

        const user = await collection.findOne({
            email: email
        });

        return user;
    }
    catch (err) {
        throw err;
    }
    finally {
        // await client.close();
    }
}

module.exports = {
    testConnection: testConnection,
    getUser, getUser
}
