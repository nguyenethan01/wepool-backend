const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json(), cors({ credentials: true, origin: true }));

let trips = {};
let users = {};

const trip = {
  Id: "",
  Drivers: [],
  Riders: [],
};

// Join a trip
app.post("/joinTrip/:tripId", (req, res) => {
  const tripId = req.params["tripId"];
  const userInfo = req.body.info;
  const userId = userInfo.userId;
  // Add user information to directory
  if (!(userId in users)) {
    users.push(userInfo);
  }
  // Add user to pool as driver or rider
  if (userInfo.isDriver) {
    trips[tripId].Drivers.push(userId);
    console.log(`Successfully pushed driver ${userId}`);
  } else {
    trips[tripId].Riders.push(userId);
    console.log(`Successfully pushed rider ${userId}`);
  }
});

// creates Trip
app.post("/createTrip", (req, res) => {
  //create tripID
  const tripID = Math.random().toString(36).substring(2, 20);

  const reqBody = req.body;
  const params = {
    eventName: reqBody.eventName,
    organizerName: reqBody.organizerName,
    phoneNumber: reqBody.phoneNumber,
    date: Date.parse(reqBody.date),
    startTime: Date.parse(reqBody.startTime),
    endTime: Date.parse(reqBody.endTime),
  };

  //store trip in db lmfao
  trips[tripID] = params;

  res.send(tripID);
  console.log(trips[tripID]);
});

app.listen(8080, () => console.log("Example app listening on port 8080"));
