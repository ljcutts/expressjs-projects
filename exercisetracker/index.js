const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
let mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://ljcutts:PASSWORD@cluster0.trzd8sq.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

let userSchema = new mongoose.Schema({
  username: String,
  count: Number,
  logs: [
    {
      description: String || null,
      duration: Number || null,
      date: String || null,
    },
  ],
});

let User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  let newUser = new User({
    username: req.body.username,
    count: 0,
    logs: [
      {
        description: null,
        duration: null,
        date: null,
      },
    ],
  });
  User.findOne({ username: req.body.username }, (err, data) => {
    if (err) return console.log(err);
    if (data) {
      res.send("USER ALREADY EXISTS");
    } else {
      newUser.save((err, data) => {
        if (err) return console.log(err);
        res.send({ username: req.body.username, _id: data._id.toString() });
      });
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let date;
  if (
    isNaN(Number(req.body.duration)) ||
    !isNaN(Number(req.body.description))
  ) {
    return;
  }
  if (req.body.date === null) {
    date = new Date().toDateString();
  } else {
    date = new Date(req.body.date).toDateString();
  }
  User.findOne({ _id: req.params._id }, (err, person) => {
    if (err) return console.log(err);
    if (person.logs[0].description === null) {
      User.findOneAndUpdate(
        { _id: req.params._id },
        {
          $inc: {
            count: 1,
          },
          logs: [
            {
              description: req.body.description,
              duration: req.body.duration,
              date: date,
            },
          ],
        },
        { new: true },
        (err, data) => {
          if (err) return console.log(err);
          res.json({
            _id: req.params._id,
            username: data.username,
            date: date,
            duration: Number(req.body.duration),
            description: req.body.description,
          });
        }
      );
    } else {
      User.findOneAndUpdate(
        { _id: req.params._id },
        {
          $inc: {
            count: 1,
          },
          $push: {
            logs: {
              description: req.body.description,
              duration: req.body.duration,
              date: date,
            },
          },
        },
        { new: true },
        (err, data) => {
          if (err) return console.log(err);
          res.json({
            _id: req.params._id,
            username: data.username,
            date: date,
            duration: Number(req.body.duration),
            description: req.body.description,
          });
        }
      );
    }
  });
});

app.get("/api/users", (req, res) => {
  const userArray = [];
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    for (let i = 0; i < data.length; i++) {
      userArray.push({ username: data[i].username, _id: data[i]._id });
    }
    res.send(userArray);
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const firstLogs = [];
  const secondLogs = [];
  if (req.query.from && req.query.to && req.query.limit) {
    User.findById(req.params._id, (err, data) => {
      if (err) return console.log(err);
      for (let i = 0; i < data.logs.length; i++) {
        if (
          new Date(data.logs[i].date).getTime() >=
            new Date(req.query.from).getTime() &&
          new Date(data.logs[i].date).getTime() <=
            new Date(req.query.to).getTime()
        ) {
          firstLogs.push(data.logs[i]);
        }
      }
      for (let i = 0; i < req.query.limit; i++) {
        secondLogs.push(firstLogs[i]);
      }
      res.json({
        _id: data._id.toString(),
        username: data.username,
        count: data.count,
        log: secondLogs,
      });
    });
  } else if (req.query.from && req.query.to) {
    User.findById(req.params._id, (err, data) => {
      if (err) return console.log(err);
      for (let i = 0; i < data.logs.length; i++) {
        if (
          new Date(data.logs[i].date).getTime() >=
            new Date(req.query.from).getTime() &&
          new Date(data.logs[i].date).getTime() <=
            new Date(req.query.to).getTime()
        ) {
          firstLogs.push(data.logs[i]);
        }
      }
      res.json({
        _id: data._id.toString(),
        username: data.username,
        count: data.count,
        log: firstLogs,
      });
    });
  } else if (req.query.limit) {
    User.findById(req.params._id, (err, data) => {
      if (err) return console.log(err);
      for (let i = 0; i < req.query.limit; i++) {
        firstLogs.push(data.logs[i]);
      }
      console.log(firstLogs.map((l) => console.log(l)));
      res.json({
        _id: data._id.toString(),
        username: data.username,
        count: data.count,
        log: firstLogs,
      });
    });
  } else {
    User.findById(req.params._id, (err, data) => {
      if (err) return console.log(err);
      res.json({
        _id: data._id.toString(),
        username: data.username,
        count: data.count,
        log: data.logs,
      });
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
