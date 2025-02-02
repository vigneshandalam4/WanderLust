const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';//change url here keep mongo atlas url

main().then(() => {
    console.log("Connected sucessfully");
}).catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);

   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({ ...obj, owner: "678fdc3fbbc11ca7bfb3bdfe",}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();