require('dotenv').config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const Moment = require("moment");

// let sid = "";

async function createConversation(name){
  let conversation = await client.conversations.conversations.create({ friendlyName: name });
  console.log("Conversation:", JSON.stringify(conversation));
  // sid =  conversation.sid;
  // let conversation2 = await client.conversations.conversations(sid).fetch();
  // console.log(conversation2)
  // chatServiceSid = conversation2.chatServiceSid;
  // console.log(sid,chatServiceSid);
  // return chatServiceSid;
  return conversation.sid;
}

// createConversation();

// client.conversations.conversations
//                     .create({friendlyName: 'My First Conversation'})
//                     .then(conversation => console.log(conversation.sid));


// // https://www.npmjs.com/package/@twilio/conversations
// async function test() {
//   let chatSid = await createConversation();
//   console.log(chatSid);
//   client.conversations.conversations(chatSid)
//         .fetch()
//         .then(conversation => console.log(JSON.stringify(conversation)));
// }

// test();


let botNumber = "+19124553417";

let sid = "CHadea53cc70a544179c6f0e350697770c";
async function addPerson(sid, number) {
  client.conversations.conversations(sid)
                    .participants
                    .create({'messagingBinding.address': number})
                    .then(participant => console.log(participant.sid))
                    .catch(exception => console.log(exception));
}

async function addBot(sid) {
  client.conversations.conversations(sid)
  .participants
  .create({
    identity: 'Zuber',
    'messagingBinding.projectedAddress': botNumber
  })
  .then(participant => console.log(participant.sid))
  .catch(exception => console.log(exception));
}

async function sendMessage(sid, msg) {
  client.conversations.conversations(sid)
    .messages
    .create({
      author: 'Zuber',
      body: msg,
     })
    .then(message => console.log(message.sid))
    .catch(exception => console.log(exception));
}

// addBot(sid);

// sendMessage(sid, "Hey everyone");

async function closeChat(sid) {
  client.conversations.conversations(sid)
      .remove()
      .then(conversation => console.log(conversation.friendlyName));
}

// sid = "CH7adf6f3e9244495baa178f60befd461c";

async function createGroupChat(driver, passengers, trip) {
  let { eventName, organizerName, startTime } = trip;

  let sid = await createConversation(`${driver.name}'s car for ${organizerName}'s ${eventName} on ${startTime.calendar()}`);
  console.log("Adding bot");
  await addBot(sid);
  console.log("Adding", driver.name);
  await addPerson(sid, driver.phone);
  passengers.map(async (passenger) => {
    console.log("Adding", passenger.name);
    await addPerson(sid, passenger.phone);
  });

  setTimeout(async () => {
    let message = `Zuber here: say hi to your car for ${organizerName}'s ${eventName} on ${startTime.calendar()}.`;
    message += `\n * Driver: ${driver.name} (${driver.phone})`;
    passengers.forEach((passenger) => {
      message += `\n * ${passenger.name} (${passenger.phone})`;
    });
    console.log(message);
    await sendMessage(sid, message);
    setTimeout(async () => {
      await closeChat(sid);
    }, 2000);
  }, 2000);
}

let trip = {
};

// closeChat("CH8daea75635d341bebd9948d8282eadae");
// console.log(createGroupChat(trip.drivers[0], trip.passengers, trip));

module.exports = createGroupChat;