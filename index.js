require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const app = express();
const port = 3000;
const noteRoutes = require("./routes/noteRoutes");
const logIn = require("./middleware/requireLogin");
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/notes",logIn, noteRoutes); //routes will be -> /..... because this: gets added later /api/notes - note #2 routes mounted before since we need them first, adding logIn as a third parameter




app.use(express.static("public"));//handling static files
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.redirect("/")
);

app.get("/logout", (req, res) => {
    req.logout(() => res.redirect("/"));
});

app.get("/api/me", (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ loggedIn: true, email: req.user.emails[0].value, name: req.user.displayName });
    }
    res.json({ loggedIn: false });
});


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(port,()=>{
        console.log("Connected to server");
    });
})
.catch((err)=>{
    console.error("Failed to connect to MongoDB:", err);
});



