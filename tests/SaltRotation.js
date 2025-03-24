require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const useragent = require("useragent");
const User = require("../models/userModel");

const MONGO_URI = process.env.CONNECTION_STRING;
const SALT_EXPIRY_DAYS = 7;

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database connected");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        process.exit(1);
    }
}

async function rotateSalt(user, password, currentMetadata) {
    // Ensure saltUpdatedAt is a valid Date
    const lastSaltUpdate = user.saltUpdatedAt ? new Date(user.saltUpdatedAt) : new Date(0);
    if (isNaN(lastSaltUpdate.getTime())) {
        console.warn("Invalid saltUpdatedAt detected, resetting to epoch");
        user.saltUpdatedAt = new Date(0);
    }

    const saltAge = (Date.now() - user.saltUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (saltAge >= SALT_EXPIRY_DAYS || user.saltMetadata !== currentMetadata) {
        user.salt = bcrypt.genSaltSync(12);
        user.password = bcrypt.hashSync(password + user.salt, 12);
        user.saltMetadata = currentMetadata;
        user.saltUpdatedAt = new Date();
        await user.save();
        console.log("Salt rotated successfully");
    }
}

async function login(email, password, userAgentString) {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found");
        return;
    }

    const agent = useragent.parse(userAgentString);
    const currentMetadata = `${agent.os} ${agent.device} ${agent.family}`;

    await rotateSalt(user, password, currentMetadata);

    const isMatch = bcrypt.compareSync(password + user.salt, user.password);
    console.log(isMatch ? "Password verified" : "Password incorrect");

    await mongoose.connection.close();
}

const testUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";
login("user1@example.com", "Test@123").catch(console.error);
