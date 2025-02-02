const User = require("../models/user.js");

//signup route callbacks
module.exports.renderSignupForm = (req,res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req,res) => {
    try{
        let { username,email,password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register( newUser, password );
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success","Signed up and Logged in successfully!");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}

//login route callbacks
module.exports.renderLoginForm = (req,res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req,res) => {
    // res.send("Logged in sucessfully!");
    req.flash("success","Logged in Successfully!");
    // let redirectUrl;
    // if(res.locals.redirectUrl){
    //     redirectUrl = res.locals.redirectUrl;
    // }else{
    //     redirectUrl = "/listings";
    // }
    //the above 5 lines can also be written like this
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

//logout route callback
module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success","Logged out successfully!");
        res.redirect("/listings");
    });
}