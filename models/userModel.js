const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please enter a user name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email address already taken"],
        trim: true,
        index: true
    },
    password: {
        type: String,
    },
    salt: {
        type: String,
    },
    saltMetadata: {
        type: String,
    },
    saltUpdatedAt: {
        type: Date, 
        default: Date.now
    },
    googleId: { 
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
