const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json(), cors({ credentials: true, origin: true }));

let trips = {};
let users = {};

// Get a trip
app.get("/getTrip/:tripId", (req, res) => {
  return trips[req.params["tripId"]];
});

// Join a trip
app.post("/joinTrip/:tripId", (req, res) => {
  const tripId = req.params["tripId"];
  const userInfo = req.body.info;
  const userId = userInfo.userId;
  // Add user information to directory
  if (!(userId in users)) {
    users[userId] = userInfo;
  }
  if (!(tripId in trips)) {
    trips[tripId] = {Id: tripId, Drivers: [], Riders: []}
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

// finalize a trip
// TODO: implement algorithm
app.post("/finalizeTrip/:tripId", (req, res) => {
  const tripId = req.params["tripId"];
  const drivers = trips[tripId].Drivers;
  const riders = trips[tripId].Riders;
  const numDrivers = drivers.length;
  const numRiders = riders.length;
  let groups = {}; // driver -> riders mapping
  drivers.forEach((driver) => {
    // assign riders
    if (driver in groups){
      continue;
    }
    groups[driver] = [];
    for (let i=0;i<numDrivers/numRiders;i++){
      groups[driver].push(riders[0])
      riders.shift()
    }
  });
  return groups
});

app.listen(8080, () => console.log("Example app listening on port 8080"));
