const mongoose = require("mongoose");

const settingsSchema = require("./Settings");
const todoSchema = require("./Todo");
const deliverableSchema = require("./Deliverable");
const spaceSchema = require("./Space");

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    todos: [todoSchema],
    user_deliverables: [deliverableSchema],
    user_spaces: [spaceSchema],
    is_google: {
        type: Boolean,
        required: true,
        default: false
    },
    settings: {
        type: settingsSchema,
        required: true,
    },
})

module.exports = mongoose.model("User", userSchema);