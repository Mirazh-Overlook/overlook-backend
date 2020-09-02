//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin:07aug1998@cluster0.0phgw.mongodb.net/userDB?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
	name: String,
	username: String,
	dob: { type: Date },
	gender: String,
	password: String,
});

userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
	res.redirect("/login");
});

app.get("/home", function(req, res){
	res.render("home");
});

app.get("/login", function(req, res){
	res.render("login");
});

app.get("/register", function(req, res){
	res.render("register");
});

app.get("/dashboard", function(req, res){
	res.render("dashboard");
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect('/');

});

app.post("/register", function(req, res){

	const date = new Date(req.body.dob);

	if (req.body.male === 'on') {
		gen = 'Male'
	} else {
		gen = 'Female'
	}

	User.register(
		{
			name: req.body.name,
			username: req.body.username,
			dob: date,
			gender: gen
		},
		req.body.password,
		function(err, user){
			if(err) {
				console.log(err)
				res.redirect("/register");
			} else {
				passport.authenticate("local")(req, res, function() {
					res.redirect("/login");
				});
			}
		})
});

app.post("/login", function(req, res){

	const user = new User({
		username: req.body.username,
		password: req.body.password
	})

	req.login(user, function(err){
		if (err) {
			console.log(err);
			res.redirect("/login");
		} else {
			passport.authenticate("local")(req, res, function(){
				res.render("dashboard", {name: req.user.name});
				// res.redirect("/dashboard");
				// console.log(req.user.name);
				// res.render("list", {listTitle: foundList.name, newlistitems: foundList.items});

			});
		}
	});
});


app.listen(3000, function(){
	console.log("Server started on port 3000.");
});
