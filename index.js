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

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});


app.listen("3000", () => {
    console.log("Listening on port 3000...")
});