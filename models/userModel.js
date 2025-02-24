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
        index: true // Improves query performance
    },
    password: {
        type: String,
        required: [true, "Please enter a user password"]
    },
    salt: {
        type: String,
        required: true // Stores the actual cryptographic salt
    },
    saltMetadata: {
        type: String,
        required: true // Stores device/browser metadata for dynamic salts
    },
    saltUpdatedAt: {
        type: Date, 
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
