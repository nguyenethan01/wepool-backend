import express from "express";
const app = express();

let trips = {};

// creates Trip

app.post("/createTrip", (req, res) => {
  //create tripID
  const tripID = Math.random().toString(36).substring(2, 10);
  //store trip in db lmfao
  trips[tripID] = 0;
  res.send(tripID);
});
