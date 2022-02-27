const express = require("express");
const cors = require("cors");
const app = express();
const Moment = require("moment");
const distance = require("hpsweb-google-distance");
const _ = require("lodash");
const createGroupChat = require("./twilio-helper");
require('dotenv').config()

app.use(express.json(), cors({ credentials: true, origin: true }));

let trips = {
  test: {
    eventName: "Bowling Night",
    organizerName: "Sydney Chiang",
    phoneNumber: "+***REMOVED***",
    destination: "3415 Michelson Dr Irvine, CA 92612",
    startTime: Moment("2022-03-01 18:00", 'YYYY-MM-DD HH:mm'),
    endTime: Moment("2022-03-01 23:00", 'YYYY-MM-DD HH:mm'),
    drivers: [{
      name: "Ethan Nguyen",
      phone: "+17148840059"
    }],
    passengers: [{
      name: "Chris Tian",
      phone: "+16504756985"
    },{
      name: "Jane Vo",
      phone: "+16266521052"
    },{
      name: "Alec Chen",
      phone: "+15106764409"
    }],
  },
  test2: {
    eventName: "Bowling Night",
    organizerName: "Sydney Chiang",
    phoneNumber: "+***REMOVED***",
    destination: "3415 Michelson Dr Irvine, CA 92612",
    startTime: Moment("2022-03-01 18:00", 'YYYY-MM-DD HH:mm'),
    endTime: Moment("2022-03-01 23:00", 'YYYY-MM-DD HH:mm'),
    drivers: [{
      name: "Ethan Nguyen",
      phone: "+17148840059",
      coords: {
        lat: 33.6459,
        lng: -117.8428
      },
      passengers: 4
    },{
      name: "Sydney Chiang",
      phone: "+16504756985",
      coords: {
        lat: 33.6507,
        lng: -117.8383
      },
      passengers: 4
    }],
    passengers: [{
      name: "Chris Tian",
      phone: "+16504756985",
      coords: {
        lat: 33.645,
        lng: -117.844
      }
    },{
      name: "Jane Vo",
      phone: "+16266521052",
      coords: {
        lat: 33.646,
        lng: -117.8443
      }
    },{
      name: "Alec Chen",
      phone: "+15106764409",
      coords: {
        lat: 33.651,
        lng: -117.8332
      }
    },{
      name: "Zubair Sidhu",
      phone: "+16504756985",
      coords: {
        lat: 33.6498,
        lng: -117.8338
      }
    }],
  },
  test3: {
    eventName: "Ice Skating",
    organizerName: "Joshua Liu",
    phoneNumber: "+***REMOVED***",
    destination: "888 Phantom Irvine, CA 92612",
    startTime: Moment("2022-03-15 18:00", 'YYYY-MM-DD HH:mm'),
    endTime: Moment("2022-03-15 23:00", 'YYYY-MM-DD HH:mm'),
    drivers: [{
      name: "Ethan Nguyen",
      phone: "+17148840059"
    }],
    passengers: [{
      name: "Chris Tian",
      phone: "+16504756985"
    },{
      name: "Jane Vo",
      phone: "+16266521052"
    },{
      name: "Alec Chen",
      phone: "+15106764409"
    }],
  }
};
let users = {};


// Get all trips
app.get("/getTrip", (req, res) => {
  res.send(trips);
});

// Get a trip
app.get("/getTrip/:tripId", (req, res) => {
  res.send(trips[req.params["tripId"]]);
});

// Join a trip
app.post("/joinTrip/:tripId", (req, res) => {
  const tripId = req.params["tripId"];
  const userInfo = req.body;
  console.log(userInfo)
  // const userId = userInfo.userId;
  // Add user information to directory
  // if (!(userId in users)) {
  //   users[userId] = userInfo;
  // }
  if (!(tripId in trips)) {
    trips[tripId] = {id: tripId, drivers: [], passengers: []}
  }
  // Add user to pool as driver or rider
  if (userInfo.isDriver === 'd') {
    trips[tripId].drivers.push(userInfo);
    console.log(`Successfully pushed driver ${userInfo.name}`);
  } else {
    trips[tripId].passengers.push(userInfo);
    console.log(`Successfully pushed rider ${userInfo.name}`);
  }
  res.send('success :D');
});

// creates Trip
app.post("/createTrip", (req, res) => {
  //create tripID
  const tripID = Math.random().toString(36).substring(2, 20);

  const reqBody = req.body;
  const dateString = reqBody.date;
  const params = {
    eventName: reqBody.eventName,
    organizerName: reqBody.organizerName,
    phoneNumber: reqBody.phoneNumber,
    destination: reqBody.destination,
    startTime: Moment(dateString + ' ' + reqBody.startTime, 'YYYY-MM-DD HH:mm'),
    endTime: Moment(dateString + ' ' + reqBody.endTime, 'YYYY-MM-DD HH:mm'),
    drivers: [],
    passengers: [],
  };

  //store trip in db lmfao
  trips[tripID] = params;

  res.send(tripID);
  console.log(tripID);
  console.log(trips[tripID]);
});

async function getDistance(from, to) {
  const resp = await distance.get({
    index: 1,
    origin: from.lat + ',' + from.lng,
    destination: to.lat + ',' + to.lng
  });
  return resp.durationValue;
}

const getDistanceM = _.memoize(getDistance);

Array.prototype.remove_by_value = function(val) {
  for (var i = 0; i < this.length; i++) {
   if (this[i] === val) {
    this.splice(i, 1);
    i--;
   }
  }
  return this;
 }

function getDriverByName(drivers, name) {
  for (var i=0; i<drivers.length; i++) {
    if (drivers[i].name === name) {
      return drivers[i];
    }
  }
}

// finalize a trip
// TODO: implement algorithm
app.post("/finalize/:tripId", async (req, res) => {
  const tripId = req.params["tripId"];
  let drivers = trips[tripId].drivers;
  let riders = trips[tripId].passengers;
  const numDrivers = drivers.length;
  const numRiders = riders.length;
  const ridersPerGroup = numRiders/numDrivers;
  let groups = {}; // driver -> riders mapping
  // drivers.forEach((driver) => {
  //   // assign riders -- the algorithm
  //   if (driver in groups){
  //     return;
  //   }
  //   groups[driver] = [];
  //   for (let i=0;i<Math.min(ridersPerGroup, riders.length);i++){
  //     groups[driver].push(riders[0])
  //     riders.shift()
  //   }
  // });
  // console.log(drivers, riders);
  let totalSeats = 0;
  let driverLocations = {};
  let driverDistances = {};
  let driverPools = {}
  drivers.forEach((driver) => {
    driverLocations[driver.name] = driver.coords;
    driverDistances[driver.name] = 0;
    driverPools[driver.name] = [];
  });
  drivers.forEach(driver => {
    totalSeats += driver.passengers;
  });
  if (totalSeats < numRiders) {
    res.send({error: "fail"});
    return;
  }
  let ridersPlaced = 0;
  while (ridersPlaced < numRiders) {
    let closest = 99999999;
    let bestDriver = null;
    let bestPassenger = null;
    for (let driver of drivers) {
      for (let rider of riders) {
        let dist = await getDistance(driverLocations[driver.name], rider.coords);
        // console.log("dist", dist);
        // console.log("testing", driver.name, " -> ", rider.name, dist);
        if (driverDistances[driver.name] + dist < closest) {
          bestDriver = driver;
          bestPassenger = rider;
          closest = driverDistances[driver.name] + dist;
        }
      } 
    }
    ridersPlaced += 1;
    // console.log(bestDriver.name, " -> ", bestPassenger.name);
    driverLocations[bestDriver.name] = bestPassenger.coords;
    driverDistances[bestDriver.name] = closest;
    driverPools[bestDriver.name].push(bestPassenger);
    if (driverPools[bestDriver.name].length >= bestDriver.passengers) {
      drivers.remove_by_value(bestDriver);
    }
    riders.remove_by_value(bestPassenger);
  }
  console.log(driverPools);
  Object.entries(driverPools).forEach(([k, v]) => {
    let driver = getDriverByName(drivers, k);
    console.log(driver, v);
    createGroupChat(driver, v, trips[tripId]);
  })
  res.send(driverPools);
  // TODO: display finalized data in dashboard
});

distance.apiKey = process.env.GOOGLE;

// distance.get({
//   index: 1,
//   origin: "33.6434103,-117.8420698",
//   destination: "33.677,-117.8124"
// }).then(function (data) {
//   console.log(data);
// })

app.listen(8080, () => console.log("Example app listening on port 8080"));
