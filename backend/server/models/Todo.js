const mongoose = require("mongoose");

const durationSchema = new mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    }
});

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    dates: {
        type: durationSchema,
        required: false
    },
    times: {
        type: durationSchema,
        required: false
    },
    deliverable: {
        type: String,
        required: false
    },
    space: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    },
}, { timestamps: true });

module.exports = todoSchema;
