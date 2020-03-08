import express from "express";
import cors from "cors";
import socketio from "socket.io";
import _ from "lodash";
import socketioJwt from "socketio-jwt";
import process from "process";

const app = express();
const server = require("http").Server(app);
const io = socketio(server);

const rowmaNsp = io.of("/rowma")

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
import { authorizeDevice } from "./auth";

import DatabaseInterface from "./db/database-interface";
import inmemoryDb from "./db/inmemory-database";
import mongodb from "./db/mongodb";
import * as mongodbConnection from './lib/mongo-connection';

const DATABASE = process.env.ROWMA_DB || 'inmemory'

let db: DatabaseInterface;

if (DATABASE === 'inmemory') {
  const robotInmemoryDatabase: Array<Robot> = [];
  const deviceInmemoryDatabase: Array<Device> = [];
  db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);
} else {
 mongodbConnection.connect().then(() => {
   db = new mongodb(mongodbConnection);
 })
}

const PORT = process.env.PORT || 3000;
server.listen(PORT);
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

const robotEventHandlers = (socket, deviceNsp) => {
  // From ROS
  socket.on("register_robot", (payload: any, ack: Function = _.noop) =>
    registerRobot(db, socket, payload, ack)
  );
  socket.on("update_rosnodes", (payload: any, ack: Function = _.noop) =>
    updateRosnodes(db, payload, ack)
  );
  socket.on("disconnect", () => db.removeRobot(socket.id));
  socket.on("topic_from_ros", (payload: any, ack: Function = _.noop) =>
    topicFromRos(db, socket, payload, ack, deviceNsp)
  );
}

const handlerWithAuth = (socket: socketioJwt.Socket, eventName: string, handler: Function) => {
  socket.on(eventName, async (payload: any, ack: Function = _.noop) => {
    const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
    if (authUrl) {
      const { authz } = await authorizeDevice(socket.decoded_token.sub, socket.handshake.query.swarmName, eventName);
      if (!authz) {
        const authzMsg = "You are not authorized.";
        socket.emit('unauthorized', authzMsg);
        return;
      }
    }

    handler(payload, ack)
  });
}

const deviceEventHandlers = (socket, robotNsp) => {
  // From Device
  handlerWithAuth(socket, "register_device", (payload: any, ack: Function = _.noop) =>
    registerDevice(db, socket, payload, ack)
  );
  handlerWithAuth(socket, "run_launch", (payload: any, ack: Function = _.noop) =>
    runLaunch(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(socket,"run_rosrun", (payload: any, ack: Function = _.noop) =>
    runRosrun(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(socket,"delegate", (payload: any, ack: Function = _.noop) =>
    delegate(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(socket, "kill_rosnodes", (payload: any, ack: Function = _.noop) =>
    killRosnode(db, socket, payload, ack, robotNsp)
  );
}

const eventHandlers = (socket) => {
  robotEventHandlers(socket, rowmaNsp);
  deviceEventHandlers(socket, rowmaNsp);
}

const deviceNsp = io.of("/rowma_device")
const robotNsp = io.of("/rowma_robot")

const secret = process.env.PUBKEY_AUTH0 || '';
const cert = Buffer.from(secret, 'base64');
deviceNsp.on('connection', socketioJwt.authorize({
  secret: cert,
  timeout: 15000,
  algorithms: ['RS256']
})).on('authenticated', async (socket) => {
  socket.use(async (packeg, next) => {
    // TODO: Check if AUTH_URL exists
    const { swarmName } = socket.handshake.query;
    const id = socket.decoded_token.sub
    const { auth, error } = await authenticateDevice(id, swarmName)
    if (!auth) {
      const msg = 'unauthenticated';
      socket.emit('unauthenticated', msg);
    } else {
      next();
    }
  })

  deviceEventHandlers(socket, robotNsp)
});

robotNsp.on("connection", socket => {
  robotEventHandlers(socket, deviceNsp);
})

rowmaNsp.on("connection", socket => {
  eventHandlers(socket);
})

server.on('close', async() => {
  console.log('Stopping ...');
  // TODO: Consider removing device connections
  await db.removeCurrentRobotConnections();
  process.exit(1);
});

process.on('SIGINT', function() {
  server.close();
});

// Note: https://blog.fullstacktraining.com/cannot-redeclare-block-scoped-variable-name/
export {};
