const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const useragent = require("useragent");

// Salt expiration time (e.g., 7 days)
const SALT_EXPIRY_DAYS = 7;

//@desc Register user
//@route POST /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    // Check if the user already exists
    const userAvailable = await User.findOne({ email });
    if (userAvailable) {
        res.status(400);
        throw new Error("User already registered");
    }

    // Extract device/browser metadata
    const agent = useragent.parse(req.headers["user-agent"]);
    const saltMetadata = `${agent.os} ${agent.device} ${agent.family}`;

    // Generate a dynamic salt
    const dynamicSalt = bcrypt.genSaltSync(12);
    const workFactor = 12; // Adaptive work factor

    // Hash password with dynamic salt
    const hashedPassword = bcrypt.hashSync(password + dynamicSalt, workFactor);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        salt: dynamicSalt,
        saltMetadata,
        saltUpdatedAt: new Date() // Store last salt update time
    });

    if (user) {
        res.status(201).json({ _id: user.id, name: user.username, email: user.email });
    } else {
        res.status(400);
        throw new Error("User data not valid");
    }
});

//@desc Login user with periodic salt updates
//@route POST /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    // Extract device/browser metadata
    const agent = useragent.parse(req.headers["user-agent"]);
    const currentMetadata = `${agent.os} ${agent.device} ${agent.family}`;

    // Check if salt needs to be updated
    const lastSaltUpdate = new Date(user.saltUpdatedAt);
    const saltAge = (Date.now() - lastSaltUpdate) / (1000 * 60 * 60 * 24); // Convert to days
    let dynamicSalt = user.salt;
    
    if (saltAge >= SALT_EXPIRY_DAYS || user.saltMetadata !== currentMetadata) {
        // Regenerate salt if expired or metadata has changed
        dynamicSalt = bcrypt.genSaltSync(12);
        const newHashedPassword = bcrypt.hashSync(password + dynamicSalt, 12);

        // Update user's salt, metadata, and password
        user.salt = dynamicSalt;
        user.saltMetadata = currentMetadata;
        user.password = newHashedPassword;
        user.saltUpdatedAt = new Date();

        await user.save(); // Persist updates to DB
    }

    // Verify password with latest salt
    const isMatch = bcrypt.compareSync(password + dynamicSalt, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const accessToken = jwt.sign(
        {
            user: {
                username: user.username,
                email: user.email,
                id: user.id
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
    );
    

    res.status(200).json({ token: accessToken });
});

//@desc Current user
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.json(req.user);
});

//@desc Google OAuth Success
//@route GET /api/user/auth/google/callback
//@access Public
const googleAuthSuccess = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.token) {
      res.status(401);
      throw new Error("Google OAuth failed");
    }
  
    const token = req.user.token;
    // Redirect to frontend like normal auth
    res.redirect(`http://127.0.0.1:5501/mycontacts-frontend/home.html?token=${token}`);
});

module.exports = { registerUser, loginUser, currentUser, googleAuthSuccess };
