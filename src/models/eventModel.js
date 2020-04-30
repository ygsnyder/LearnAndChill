const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    status: {
        type: String
    },
    creator:{
        type: mongoose.ObjectId,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    eventDescription: {
        type: String,
        required: true
    },
    maxPersons: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    eventImage: {
        file: { type: Buffer, required: true},
        filename: { type: String, required: true},
        mimetype: { type: String, required: true}
    }
});

module.exports = mongoose.model('events', eventSchema);