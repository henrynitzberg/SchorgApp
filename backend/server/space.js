const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv").config();
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);

async function getSpace(access_code) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const collection = db.collection("Spaces");

        const space = await collection.findOne({
            access_code: access_code
        });

        console.log(space);

        return space;
    }
    catch (err) {
        throw err;
    }
    finally {
        await client.close();
    }
}

async function writePeople(spaceId, people) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const spaces = db.collection("Spaces");

        await spaces.updateOne(
            { _id: ObjectId.createFromHexString(spaceId) },
            { $push: {
                people: {
                    $each: people
                }
            } }
        );
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = {
    getSpace: getSpace,
    writePeople: writePeople,
};