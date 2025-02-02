const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = 3000;
const path = require("path");
//dotenv - loads environment variables from .env to process.env
if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET);
//listingschema (client side)
const Listing = require("./models/listing.js");
//method overriding - forms can only use get,post for using other types
const methodOverride = require("method-override");
//ejs-mate - we use some codes again and again like those we can keep them in some other files like boilerplate code
//and we can use them frequently with one line of code, more organizing of data
const ejsMate = require("ejs-mate");
//wrapasync - error handling instead of try catch
const wrapAsync = require("./utils/wrapAsync.js");
//custom express error created for us
const ExpressError = require("./utils/ExpressError.js");
//schema's (server side) using joi
const { listingSchema, reviewSchema } = require("./schema.js");
//reviewschema (client side)
const Review = require("./models/review.js");
//express session - sessionid ,cookie... and connect-mongo
const session = require("express-session");
const MongoStore = require('connect-mongo');
//connect-flash flashes message only once then deletes it,like user registered succesfully...
const flash = require("connect-flash");
//passport for userschema login signup,...
// requires the model with Passport-Local Mongoose plugged in
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


//listings route
const listingRouter = require("./routes/listing.js");
//reviews route
const reviewRouter = require("./routes/review.js");
//User route
const userRouter = require("./routes/user.js");

// Set EJS as the view engine for rendering templates
app.set('view engine', 'ejs');
// Specify the directory where the views (EJS files) are located
app.set('views', path.join(__dirname, 'views'));
// Parse incoming request bodies with URL-encoded payloads (e.g., form data)
app.use(express.urlencoded({ extended: true }));
// Override HTTP methods with a query parameter (_method) for supporting PUT/DELETE in forms
app.use(methodOverride("_method"));
// Use EJS Mate as the template engine for better layout management
app.engine("ejs", ejsMate);
// Serve static files (e.g., CSS, JS, images) from the 'public' directory
app.use(express.static(path.join(__dirname, "/public")));

//connection to database
// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected sucessfully");
}).catch((err) => { 
    console.log(err);
});

async function main(){
    // await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);

   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.get("/",(req,res) => {
    // res.send("Working! This is root");
    res.redirect("/listings");
});

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", () => {
    console.log("Error in mongo session store",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};

//sessionid and 
app.use(session(sessionOptions));
app.use(flash());

//a middleware that initalizes passport
app.use(passport.initialize());
// A web application needs the ability to identify users as they browse from page to page. This series of requests
// and responses, each associated with the same user, is known as a session.
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flashing messages and using res.locals
app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    // console.log(res.locals.success);
    //if user exists or not
    res.locals.currUser = req.user;
    next();
});

// //fake demo user 
// app.get("/demouser",async (req,res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student"
//     });

//     let registeredUser = await User.register(fakeUser,"1234");
//     res.send(registeredUser); 
// });

// app.get("/testListing",async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Panaji, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful");
// });

//Listings ,seperate route created
app.use("/listings",listingRouter);
//Reviews, seperate route 
app.use("/listings/:id/reviews",reviewRouter);
//User, seperate route
app.use("/",userRouter);

//error handling
//if client goes on any route which is not there in our domain ,404 page not found
app.all("*",(req,res,next) => {
    next(new ExpressError(404,"Page Not Found!"));
});

//Error Handling Middleware
app.use((err,req,res,next) => {
    let { status=500, message="Something went wrong!" } = err; 
    res.status(status).render("error.ejs",{ message });
    // res.status(status).send(message);
    // res.send("Something went wrong!");
});

//connect to server localhost port
app.listen(port,() => {
    console.log(`Listening on port: ${port}`);
});