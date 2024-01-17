require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const Users = require("./models/users");

const app = express();

// get database connection url via env variable
const mongoDB = process.env.DB_URL;

// connect to database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
};

// used to parse req.body during post request
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sign-up", (req, res) => {
  res.render("sign-up");
});

app.post("/sign-up", [
  body("firstName", "First name cannot be empty").trim().notEmpty().isLength({ min:1, max: 64 }).withMessage("Your first name cannot be longer than 64 characters"),
  body("lastName", "Last name cannot be empty").trim().notEmpty().isLength({ min:1, max: 64 }).withMessage("Your last name cannot be longer than 64 characters"),
  body("username", "Username cannot be empty").trim().notEmpty().isEmail().withMessage("Please input an email as your username").custom(async value => {
    const user = await Users.find({ username: value });
    if (user.length !== 0) {
      throw new Error("Email already in use");
    }
  }),
  body("password", "Password cannot be empty").custom(value => !/\s/.test(value)).withMessage("Spaces are not allowed in the password"),
  body("passwordVerification", "The passwords don't match").custom((value, { req }) => {
    return value === req.body.password
  }),
  async (req, res) => {
    const validationError = validationResult(req);

    try { 
      if (validationError.isEmpty()) {
        // if there is no validation errors...
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
          // ...hash user password...
          if (err) {
            throw new Error("Error during password encryption");
          } else {
            // ... and if there is still no errors, proceed to create a new user and add them to the database
            const newUser = new Users({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              username: req.body.username,
              password: hashedPassword,
              isMember: false,
              isAdmin: false,
            });
            await newUser.save();
            res.redirect("/");
          };
        });
      } else {
        res.render("sign-up", { errors: validationError.array(), user: matchedData(req, { onlyValidData: false }) });
      }
    } catch (err) {
      res.send(err.message);
    }
  }
]);

app.listen("3000", () => {
    console.log("Listening on port 3000...")
});