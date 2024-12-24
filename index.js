const webSocketsServerPort = process.env.PORT || 8000;
const webSocketServer = require("websocket").server;
const http = require("http");

// Spinning the http server and the websocket server.
const server = http.createServer();
server.listen(webSocketsServerPort);
console.log(`listening on port ${webSocketsServerPort}`);

const wsServer = new webSocketServer({
  httpServer: server,
  keepalive: true,
});

const clients = {};
// Temp storage of users in current server session.
let users = [];

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  return s4() + s4() + "-" + s4();
};

wsServer.on("request", function (request) {
  var userID = getUniqueID();
  console.log(
    new Date() +
      " Recieved a new connection from origin " +
      request.origin +
      "."
  );

  // You can rewrite this part of the code to accept only the requests from allowed origin
  const connection = request.accept(null, request.origin);
  clients[userID] = connection;
  console.log(
    "connected: " + userID + " in " + Object.getOwnPropertyNames(clients)
  );

  // for (key in clients) {
  clients[userID].sendUTF(JSON.stringify({ type: "users", users: users }));
  console.log("sent Users to: ", clients[userID]);
  // }

  // messages.forEach((message) => {
  //   clients[userID].sendUTF(
  //     JSON.stringify({
  //       type: "message",
  //       msg: message.msg,
  //       user: message.user,
  //     })
  //   );
  // });

  connection.on("message", function (message) {
    if (message.type === "utf8") {
      console.log("Received Message: ", message.utf8Data);
      const obj = JSON.parse(message.utf8Data);
      if (obj.type === "addUser") {
        users.push(obj.user);
        for (key in clients) {
          // clients[key].sendUTF(message.utf8Data);
          clients[key].sendUTF(JSON.stringify({ type: "users", users: users }));

          console.log("sent updated users to: ", clients[key]);
        }
      }
      // broadcasting message to all connected clients
      else {
        // messages.push({ msg: obj.msg, user: obj.user });
        for (key in clients) {
          clients[key].sendUTF(message.utf8Data);
          console.log("sent Message to: ", clients[key]);
        }
      }
    }
  });
});
