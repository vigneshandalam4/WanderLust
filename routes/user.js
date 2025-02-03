const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

//user controller
const userController = require("../controllers/user.js");


//signup routes
router.route("/signup")
    .get( userController.renderSignupForm )
    .post( wrapAsync( userController.signup ));

// router.get("/signup", userController.renderSignupForm );

// router.post("/signup", wrapAsync( userController.signup ));

//login routes
router.route("/login")
    .get( userController.renderLoginForm )
    .post( saveRedirectUrl ,
        passport.authenticate( "local", { failureRedirect: "/login", failureFlash: true } ) , 
        userController.login 
    );

// router.get("/login", userController.renderLoginForm );

// router.post("/login", saveRedirectUrl ,
//     passport.authenticate( "local", { failureRedirect: "/login", failureFlash: true } ) , 
//     userController.login 
// );

//logout route
router.get("/logout", userController.logout );

//miscellaneous - footer section
router.get("/privacy",(req,res) => {
    res.render("miscellaneous/privacy.ejs");
});

router.get("/terms",(req,res) => {
    res.render("miscellaneous/terms.ejs");
});

module.exports = router;
