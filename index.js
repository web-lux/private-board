require('dotenv').config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const { body, validationResult, matchedData } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("./models/users");

// get database connection url via env variable
const mongoDB = process.env.DB_URL;

// connect to database
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
};

const app = express();
app.set('view engine', 'ejs');

// used by passport
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      };
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" })
      }
      // get called only if user exists and passwords match
      return done(null, user);
    } catch(err) {
      return done(err);
    };
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  };
});

app.use(passport.initialize());
app.use(passport.session());

// used to parse req.body during post request
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

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
    const user = await User.find({ username: value });
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
            const newUser = new User({
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
  })
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.listen("3000", () => {
    console.log("Listening on port 3000...")
});