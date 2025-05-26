const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "Gage"
        });
        console.log("MongoDB connected with Mongoose");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;