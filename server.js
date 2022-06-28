const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const alert = require("alert");

mongoose.connect(
  "mongodb+srv://admin-sohail:iqrarsohail@cluster0.oi89v.mongodb.net/topDB"
);

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const detailsSchema = new mongoose.Schema({
  type: String,
  first_name: String,
  last_name: String,
  phNumber: Number,
  email: String,
  password: String,
  dlNumber: String,
});

const ridesSchema = new mongoose.Schema({
  from: String,
  to: String,
  date: String,
  driverEmail: String,
  seats: Number,
  price: Number,
  driver: detailsSchema,
});

const Person = mongoose.model("Person", detailsSchema);
const Ride = mongoose.model("Ride", ridesSchema);

app.get("/", function (req, res) {
  res.render("index", { publish: 0, user: 0, userName: "" });
});

app.get("/about-us", (req, res) => {
  res.render("learn-more");
});

app.get("/register", function (req, res) {
  res.render("sign-up");
});

app.post("/register", (req, res) => {
  let x = "";

  if (req.body.register_2 == "on") x = "driver";
  else if (req.body.register_1 == "on") x = "user";

  let data = {
    type: x,
    first_name: req.body.fName,
    last_name: req.body.lName,
    phNumber: req.body.pNum,
    email: req.body.email,
    password: req.body.password,
    dlNumber: req.body.identity,
  };

  Person.exists(
    { email: req.body.email, password: req.body.password },
    function (err, doc) {
      if (err) {
        console.log(err);
        res.render("resStatus", { status: 1 });
      } else {
        if (doc) {
          alert("Already registered!");
          console.log("Already registered!");
          res.redirect("/login");
        } else {
          Person.exists({ email: req.body.email }, (err, doc) => {
            if (err) {
              console.log(err);
              res.render("resStatus", { status: 1 });
            }

            if (!doc) {
              let person = new Person(data);
              person.save();
              res.redirect("/login");
            } else {
              alert("Email is already registered");
              res.redirect("/register");
            }
          });
        }
      }
    }
  );
});

app.get("/login", (req, res) => {
  res.render("sign-in");
});

let status = false;

app.post("/login", (req, res) => {
  Person.find(
    { email: req.body.email, password: req.body.password },
    function (err, doc) {
      if (err) {
        console.log(err);
        res.render("resStatus", { status: 1 });
      } else {
        if (doc.length) {
          if (doc[0].dlNumber.length) {
            status = true;
            console.log("Successfully logged in as driver.");
            res.render("index", {
              publish: 1,
              user: 1,
              userName: doc[0].first_name + " " + doc[0].last_name,
            });
          } else {
            console.log("Successfully logged in as user.");
            res.render("index", {
              publish: 0,
              user: 1,
              userName: doc[0].first_name + " " + doc[0].last_name,
            });
          }
        } else {
          alert("Your email or password is wrong. Try again!");
          res.redirect("/login");
        }
      }
    }
  );
});

app.post("/search", (req, res) => {
  Ride.find({ to: req.body.destination, date: req.body.date }, (err, doc) => {
    if (err) {
      console.log(err);
      res.render("resStatus", { status: 1 });
    } else {
      if (doc.length) {
        res.render("searchRes", { details: doc });
      } else res.render("resStatus", { status: 2 });
    }
  });
});

app.get("/publish-ride", (req, res) => {
  if (status) res.render("rideDetails");
  else res.redirect("/");
});

app.post("/publish-ride", (req, res) => {
  Person.find({ email: req.body.driverEmail }, (err, doc) => {
    if (err) {
      console.log(err);
      res.render("resStatus", { status: 1 });
    } else {
      let data = {
        from: req.body.from,
        to: req.body.to,
        date: req.body.date,
        driverEmail: req.body.driverEmail,
        seats: req.body.seats,
        price: req.body.price,
        driver: doc[0],
      };

      let ride = new Ride(data);
      ride.save();
      res.render("resStatus", { status: 0 });
    }
  });
});

app.listen(process.env.PORT || 4000, function () {
  console.log("Server is up and running successfully");
});
