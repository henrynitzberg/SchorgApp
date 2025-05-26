const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    due_date: {
        type: Date,
        required: true
    },
    minutes_worked: {
        type: Number,
        required: true
    },
    space: {
        type: String,
        required: false
    },
    space_deliverable: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    },
}, { timestamps: true });

module.exports = deliverableSchema;
