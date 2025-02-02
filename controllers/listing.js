const Listing = require("../models/listing");
//geocoding - converts location name to geographic cordinates
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index route callback
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}

//new route callback
module.exports.renderNewForm = (req,res) => {
    // if(req.isAuthenticated()){
    //     req.flash("error","You must be Logged in to create new Listing");
    //     res.redirect("/listings");
    // }else{
    //     res.render("listings/new.ejs");
    // }
    res.render("listings/new.ejs");
}

//show route callback
module.exports.showListing = async (req,res) => {
    let {id} =req.params;
    //populate reviews and owners through their refid and then store that listing
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    // console.log(listing);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{ listing });
}

//create route callback
module.exports.createListing = async (req,res,next) => {
    // let{ title,description,image,price,country,location } = req.body;
    // let listing = req.body.listing;
    // if(!newListing.title){
    //     throw new ExpressError(400,"Title is missing");
    // }
    // console.log(req.user);
    //geocoding
    let response = await geocodingClient
        .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
        })
        .send()
    
    // console.log(response.body.features[0].geometry);
    // res.send("done!");

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log(url,"..",filename);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url ,filename };

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    // console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

//edit route callback
module.exports.renderEditForm = async (req,res) => {
    let {id} =req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");

    res.render("listings/edit.ejs",{ listing, originalImageUrl });
}

//update route callback
module.exports.updateListing = async (req,res) => {
    // let listing = await Listing.findById(id);
    // if(!listing.owner.equals(res.locals.currUser._id)){
    //     req.flash("error","You dont have permission to perform this task!");
    //     return res.redirect(`/listings/${id}`);
    // }
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url ,filename };
        await listing.save();
    }
   
    req.flash("success","Listing Updated!");
    res.redirect("/listings");
}

//delete route callback
module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!"); 
    res.redirect("/listings");
}

//filter listings by country
module.exports.filterListingsByCountry = async (req,res) => {
    const searchQuery = req.query.search; // Get input value
    
    // console.log(searchQuery);
    const filteredListings = await Listing.find({ 
        country: { $regex: new RegExp(searchQuery, "i") } // Case-insensitive match
    });

    res.render("listings/filterbycountry.ejs", { filteredListings, searchQuery });
}

//filter listings by category
module.exports.filterListingsByCategory = async(req,res) => {
    const category = req.body.category; // Get selected category

    const filteredListings = await Listing.find({ 
        category: { $regex: new RegExp(category, "i") } // Case-insensitive match
    });

    res.render("listings/filterbycategory.ejs", { filteredListings, category });
}