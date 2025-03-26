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
    const token = req.user.token;
    res.redirect(`http://127.0.0.1:5501/mycontacts-frontend/home.html?token=${token}`);
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
