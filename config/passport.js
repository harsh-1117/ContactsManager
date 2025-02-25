const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google Profile:", profile);

        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            password: "",
            salt: "",
            saltMetadata: "",
          });
          await user.save();
        }

        const secretKey = process.env.ACCESS_TOKEN_SECRET;

        // Generate JWT Token
        const token = jwt.sign(
          {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
          },
         secretKey,
          { expiresIn: "30m" }
        );

        return done(null, { user, token });
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
