const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    timestamp: {
        type: Date,
        required: true,
    },
    title: {
        required: true,
        minLength: 1,
        maxLength: 64,
    },
    text: {
        required: true,
        minLength: 1,
        maxLength: 3000,
    },
});

module.exports = mongoose.model("Message", MessageSchema);