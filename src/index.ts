import express from "express";
import cors from "cors";
import socketio from "socket.io";
import _ from "lodash";
import socketioJwt from "socketio-jwt";
import process from "process";

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

import { authenticateDevice } from "./auth";
// import { authorizeDevice } from "./auth";

import inmemoryDb from "./db/inmemory-database";
const robotInmemoryDatabase: Array<Robot> = [];
const deviceInmemoryDatabase: Array<Device> = [];
const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

// import mongodb from "./db/mongodb";
// import * as mongodbConnection from './lib/mongo-connection';
// let db;
// mongodbConnection.connect().then(() => {
//   db = new mongodb(mongodbConnection);
// })

server.listen(80);
app.use(cors());

app.get("/list_connections", async (req, res) => {
  res.writeHead(200);
  const allRobots = await db.getAllConnectedRobots()
  res.write(JSON.stringify(allRobots));
  res.end();
});

app.get("/robots", async (req, res) => {
  const robotUuid = _.get(req, "query.uuid");
  const robot = await db.findRobotByUuid(robotUuid);

  res.writeHead(200);
  res.write(JSON.stringify(robot || {}));
  res.end();
});

const robotEventHandlers = (socket) => {
  // From ROS
  socket.on("register_robot", (payload: any, ack: Function = _.noop) =>
    registerRobot(db, socket, payload, ack)
  );
  socket.on("update_rosnodes", (payload: any, ack: Function = _.noop) =>
    updateRosnodes(db, payload, ack)
  );
  socket.on("disconnect", () => db.removeRobot(socket.id));
  socket.on("topic_from_ros", (payload: any, ack: Function = _.noop) =>
    topicFromRos(db, socket, payload, ack)
  );
}

const deviceEventHandlers = (socket) => {
  // From Device
  socket.on("register_device", (payload: any, ack: Function = _.noop) =>
    registerDevice(db, socket, payload, ack)
  );
  socket.on("run_launch", (payload: any, ack: Function = _.noop) =>
    runLaunch(db, socket, payload, ack)
  );
  socket.on("run_rosrun", (payload: any, ack: Function = _.noop) =>
    runRosrun(db, socket, payload, ack)
  );
  socket.on("delegate", (payload: any, ack: Function = _.noop) => {
    // const { auth } = authorizeDevice(socket.decoded_token.sub, socket.handshake.query.swarmName, "delegate");
    // if (!auth) {
    //   const msg = "You are not authorized.";
    //   const response = createErrorResponse(msg);
    //   if (ack) ack(response);
    //   return;
    // }
    delegate(db, socket, payload, ack)
  });
  socket.on("kill_rosnodes", (payload: any, ack: Function = _.noop) =>
    killRosnode(db, socket, payload, ack)
  );
}

const eventHandlers = (socket) => {
  robotEventHandlers(socket);
  deviceEventHandlers(socket);
}

// TODO: Add swarm concept to this swarm
// const authenticate = async (id: string, swarmName: string) {
//   const authenticator = process.env.AUTHENTICATOR || '';
//   return await axios.get(`$authenticator}?id=${id}&swarm=${swarmName}`);
//   // { auth: true/false }
// }

if (process.env.AUTH_METHOD === 'jwt') {
  const secret = process.env.PUBKEY_AUTH0 || '';
  const cert = Buffer.from(secret, 'base64');
  io.of("/rowma_device").on('connection', socketioJwt.authorize({
    secret: cert,
    timeout: 15000,
    algorithms: ['RS256']
  })).on('authenticated', async (socket) => {
    // Need more authentication. If the member who sent a request is not a member of the swarm,
    // it has to be denied. However, it means more time is needed. I speculate the time is 200-300ms.
    // get the swarm name from console.log(socket.handshake.query)
    const { swarmName } = socket.handshake.query;
    const id = socket.decoded_token.sub
    const { auth, error } = await authenticateDevice(id, swarmName)
    console.log(auth, error)
    if (!auth) {
      const msg = 'unauthenticated';
      socket.emit('unauthenticated', msg);
      return;
    }
    console.log(socket.decoded_token.sub)
    deviceEventHandlers(socket)
  });

  io.of("/rowma_robot").on("connection", socket => {
    robotEventHandlers(socket);
  })
}

io.of("/rowma").on("connection", socket => {
  eventHandlers(socket);
})

server.on('close', async() => {
  console.log('Stopping ...');
  await db.removeCurrentRobotConnections();
  process.exit(1);
});

process.on('SIGINT', function() {
  server.close();
});

// Note: https://blog.fullstacktraining.com/cannot-redeclare-block-scoped-variable-name/
export {};
