const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const dotenv = require("dotenv");
dotenv.config();
const mongo_uri = process.env.MONGO_URI;

const client = new MongoClient(mongo_uri);

async function getSpaceAccess(access_code) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const collection = db.collection("Spaces");

        const space = await collection.findOne({
            access_code: access_code
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

async function getSpace(spaceId) {
    try {
        await client.connect();

        const db = client.db("Gage");
        const collection = db.collection("Spaces");

        const space = await collection.findOne({
            _id: ObjectId.createFromHexString(spaceId)
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
    getSpaceAccess: getSpaceAccess,
    getSpace: getSpace,
    writePeople: writePeople,
};