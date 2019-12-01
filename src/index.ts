import express from "express";
import cors from "cors";
import socketio from "socket.io";
import _ from "lodash";
import socketioJwt from "socketio-jwt";

const app = express();
const server = require("http").Server(app);
const io = socketio(server);

import Robot from "./entity/robot";
import Device from "./entity/device";

import {
  registerRobot,
  updateRosnodes,
  topicFromRos
} from "./eventcallback/event-from-ros";

import {
  registerDevice,
  runLaunch,
  runRosrun,
  delegate,
  killRosnode
} from "./eventcallback/event-from-device";

// import { authenticateDevice } from "./auth";
// import { authorizeDevice } from "../auth";

import inmemoryDb from "./db/inmemory-database";

const robotInmemoryDatabase: Array<Robot> = [];
const deviceInmemoryDatabase: Array<Device> = [];

const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

server.listen(80);
app.use(cors());

app.get("/list_connections", (req, res) => {
  res.writeHead(200);
  res.write(JSON.stringify(db.getAllRobots()));
  res.end();
});

app.get("/robots", (req, res) => {
  const robotUuid = _.get(req, "query.uuid");
  const robot = db.findRobotByUuid(robotUuid);

  res.writeHead(200);
  res.write(JSON.stringify(robot || {}));
  res.end();
});

const eventHandlers = (socket) => {
  // From ROS
  socket.on("register_robot", (payload: object, ack: Function = _.noop) =>
    registerRobot(db, socket, payload, ack)
  );
  socket.on("update_rosnodes", (payload: object, ack: Function = _.noop) =>
    updateRosnodes(db, payload, ack)
  );
  socket.on("disconnect", () => db.removeRobot(socket.id));
  socket.on("topic_from_ros", (payload: object, ack: Function = _.noop) =>
    topicFromRos(db, socket, payload, ack)
  );

  // From Device
  socket.on("register_device", (payload: object, ack: Function = _.noop) =>
    registerDevice(db, socket, payload, ack)
  );
  socket.on("run_launch", (payload: object, ack: Function = _.noop) =>
    runLaunch(db, socket, payload, ack)
  );
  socket.on("run_rosrun", (payload: object, ack: Function = _.noop) =>
    runRosrun(db, socket, payload, ack)
  );
  socket.on("delegate", (payload: object, ack: Function = _.noop) => {
    // const { auth } = authorizeDevice(socket.decoded_token.sub, socket.handshake.query.projectName, "delegate");
    // if (!auth) {
    //   const msg = "You are not authorized.";
    //   const response = createErrorResponse(msg);
    //   if (ack) ack(response);
    //   return;
    // }
    delegate(db, socket, payload, ack)
  });
  socket.on("kill_rosnodes", (payload: object, ack: Function = _.noop) =>
    killRosnode(db, socket, payload, ack)
  );
}

// TODO: Add team concept to this project
// const authenticate = async (id: string, teamName: string) {
//   const authenticator = process.env.AUTHENTICATOR || '';
//   return await axios.get(`$authenticator}?id=${id}&team=${teamName}`);
//   // { auth: true/false }
// }

if (process.env.AUTH_METHOD === 'auth0') {
  const secret = process.env.PUBKEY_AUTH0 || '';
  const cert = Buffer.from(secret, 'base64');
  io.of("/rowma").on('connection', socketioJwt.authorize({
    secret: cert,
    timeout: 15000,
    algorithms: ['RS256']
  })).on('authenticated', (socket) => {
    // Need more authentication. If the member who sent a request is not a member of the project,
    // it has to be denied. However, it means more time is needed. I speculate the time is 200-300ms.
    // get the team name from console.log(socket.handshake.query)
    // const { id, projectName } = socket.handshake.query;
    // const { auth } = authenticateDevice(id, projectName)
    // if (!auth) {
    //   // const msg = 'unauthenticated';
    //   // socket.emit('unauthenticated', msg);
    //   // return;
    // }
    console.log(socket.decoded_token.sub)
    eventHandlers(socket)
  });
} else {
  io.of("/rowma").on("connection", socket => {
    eventHandlers(socket)
  })
}

// Note: https://blog.fullstacktraining.com/cannot-redeclare-block-scoped-variable-name/
export {};
