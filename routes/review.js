const express = require("express");
const router = express.Router({mergeParams : true});
//custom error created
const ExpressError = require("../utils/ExpressError.js");
//wrapasync - instead of try catch
const wrapAsync = require("../utils/wrapAsync.js");
//schema's (server side) using joi
const { listingSchema, reviewSchema } = require("../schema.js");
//reviewschema (client side)
const Review = require("../models/review.js");
//listingschema (client side)
const Listing = require("../models/listing.js");
//middlewares from middleware.js
const { validateReview, isLoggedIn, isreviewAuthor } = require("../middleware.js");

//review controller
const reviewController = require("../controllers/review.js");

//Reviews
//Post Review Route
router.post("/", isLoggedIn ,validateReview , wrapAsync( reviewController.createReview ));

//Delete Review Route
router.delete("/:reviewId", isLoggedIn , isreviewAuthor ,wrapAsync( reviewController.destroyReview ));

module.exports = router;