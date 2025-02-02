//listingschema (client side)
const Listing = require("./models/listing.js")
//custom error created
const ExpressError = require("./utils/ExpressError.js");
//schema's (server side) using joi
const { listingSchema, reviewSchema } = require("./schema.js");
//reviewschema (client side)
const Review = require("./models/review.js");

//validation for schema(middleware)
//validate listing
module.exports.validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    // console.log(error);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//validation for schema(middleware)
//validate review
module.exports.validateReview = (req,res,next) => {
    let { error } = reviewSchema.validate(req.body);
    // console.log(error);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//middleware to check if user is loggedin and save redirecturl
module.exports.isLoggedIn = (req,res,next) => {
    // console.log(req.user);
    // console.log(req);
    // console.log(req.path,"...",req.originalUrl);
    if(!req.isAuthenticated()){
        //save redirectUrl if not logged in
        req.session.redirectUrl = req.originalUrl;
        req.flash("error",`You must be Logged in to perform this task on page ${req.originalUrl}`);
        res.redirect("/login");
    }else{
        next();
    }
}

//middleware to save redirecturl after logging in
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

//middleware to check if he is the owner of it
module.exports.isOwner = async (req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this Listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//middleware to check if he is author of review
module.exports.isreviewAuthor = async (req,res,next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this Review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}