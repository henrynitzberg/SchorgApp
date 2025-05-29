const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    military_time: {
        type: Boolean,
        required: true,
        default: false
    },
})
    

module.exports = settingsSchema;