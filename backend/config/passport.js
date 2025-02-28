const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const Admin = require("../models/Admin");
const User = require("../models/User");

passport.use(
  "admin", // Register 'admin' strategy
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isValid = await admin.isValidPassword(password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, admin);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  "user", // Register 'user' strategy
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isValid = await user.isValidPassword(password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user and admin for session
passport.serializeUser((user, done) => {
  done(null, {
    id: user._id,
    role: user.role,
    model: user.constructor.modelName, // To differentiate between User and Admin
  });
});

// Deserialize user and admin from session
passport.deserializeUser(async (data, done) => {
  try {
    let user;
    if (data.model === "Admin") {
      user = await Admin.findById(data.id);
    } else {
      user = await User.findById(data.id);
    }
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
