const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 64,
    },
    lastName: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 64,
    },
    username: {
        type: String,
        required: true,
        minLength: 1,
    },
    password: {
        type: String,
        required: true,
        minLength: 1,
    },
    isMember: {
        required: true,
        type:  Boolean,
    },
    isAdmin: {
        required: true,
        type: Boolean,
    }
});

UserSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("User", UserSchema);