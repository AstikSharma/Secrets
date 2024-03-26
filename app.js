import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import ejs from 'ejs';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';
import GoogleStrategy from 'passport-google-oauth20'
GoogleStrategy.Strategy;
import findOrCreate from 'mongoose-findorcreate';
dotenv.config();
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser((user, done)=> {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) =>{
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  (accessToken, refreshToken, profile, cb) =>{
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, (err, user) => {
      return cb(err, user);
    });
  }
));

app.get("/", (req, res)=>{
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  (req, res) =>{
    res.redirect("/secrets");
  });

app.get("/login", (req, res)=>{
  res.render("login");
});

app.get("/register", (req, res)=>{
  res.render("register");
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login"); 
  }
}
app.get("/secrets", ensureAuthenticated, async (req, res) => {
  try {
    const foundUsers = await User.find({"secret": {$ne: null}});
    res.render("secrets", {usersWithSecrets: foundUsers});
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/submit", (req, res)=>{
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});
app.post("/submit", async (req, res) => {
    try {
      const submittedSecret = req.body.secret;
      const foundUser = await User.findById(req.user.id);
      if (foundUser) {
        foundUser.secret = submittedSecret;
        await foundUser.save();
        res.redirect("/secrets");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  });
  app.get("/logout", (req, res)=>{
    req.logout((err) =>{
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
      } else {
        res.redirect("/");
      }
    });
  });
app.post("/register",(req, res)=>{
  User.register({username: req.body.username}, req.body.password, (err, user)=>{
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets");
      });
    }
  });
});
app.post("/login", (req, res)=>{
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
req.login(user,(err)=>{
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, ()=>{
        res.redirect("/secrets");
      });
    }
  });
});
app.listen(8000, () =>{
  console.log("Server started on port 8000.");
});
