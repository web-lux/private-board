require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

// get database connection url via env variable
const mongoDB = process.env.DB_URL;

// connect to database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
};

app.get("/", (req, res) => {
    res.send("OK");
});

app.listen("3000", () => {
    console.log("Listening on port 3000...")
});