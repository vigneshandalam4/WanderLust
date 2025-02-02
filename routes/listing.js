const express = require("express");
const router = express.Router();
//wrapasync - instead of try catch
const wrapAsync = require("../utils/wrapAsync.js");
//schema's (server side) using joi
const { listingSchema, reviewSchema } = require("../schema.js");
//custom error created
const ExpressError = require("../utils/ExpressError.js");
//listingschema (client side)
const Listing = require("../models/listing.js");
//middlewares from middleware.js
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const review = require("../models/review.js");
//multer-to parse multipart/form-data i.e to take files as input and store them in a folder dest: 'uploads/'
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

//listing controller
const listingController = require("../controllers/listing.js");

//index and create routes
router.route("/")
    .get( wrapAsync( listingController.index ))
    .post( isLoggedIn , upload.single("listing[image]") , validateListing , wrapAsync( listingController.createListing ));

//filter route by search box - by country name
router.get("/filter", wrapAsync( listingController.filterListingsByCountry ));

//filter route by filter icons - by category name
router.post("/filter", wrapAsync( listingController.filterListingsByCategory ));

//new route
router.get("/new", isLoggedIn , listingController.renderNewForm );

//show,update and delete routes
router.route("/:id")
    .get( wrapAsync( listingController.showListing ))
    .put( isLoggedIn , isOwner , upload.single("listing[image]") ,validateListing ,wrapAsync( listingController.updateListing ))
    .delete( isLoggedIn , isOwner ,wrapAsync( listingController.destroyListing ));

//edit route
router.get("/:id/edit", isLoggedIn , isOwner ,wrapAsync( listingController.renderEditForm ));

//listings
// //Index Route
// router.get("/",wrapAsync( listingController.index ));

// //New Route
// router.get("/new", isLoggedIn , listingController.renderNewForm );

// //Create Route
// router.post("/", isLoggedIn ,validateListing , wrapAsync( listingController.createListing ));

// //Show Route
// router.get("/:id", wrapAsync( listingController.showListing )); 

// //Edit Route
// router.get("/:id/edit", isLoggedIn , isOwner ,wrapAsync( listingController.renderEditForm ));

// //Update Route
// router.put("/:id", isLoggedIn , isOwner ,validateListing ,wrapAsync( listingController.updateListing ));
 
// //Delete Route
// router.delete("/:id", isLoggedIn , isOwner ,wrapAsync( listingController.destroyListing ));

module.exports = router;