const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv").config();
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);

async function getSpace(name) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const collection = db.collection("Spaces");

        const space = await collection.findOne({
            name: name
        });

        return space;
    }
    catch (err) {
        throw err;
    }
    finally {
        await client.close();
    }
}

module.exports = {
    getSpace: getSpace
};