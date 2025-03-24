const express = require("express");
const passport = require("passport");
const validateToken = require("../middleware/validateTokenHandler");
const { registerUser, loginUser, currentUser } = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/current", validateToken, currentUser);

// Google OAuth Routes
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req, res) => {
      res.json({
        message: "Google OAuth successful",
        user: req.user.user,
        token: req.user.token, // Send the JWT token
      });
    }
  );  

router.get("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.session.destroy();
        res.redirect("/");
    });
});

module.exports = router;
