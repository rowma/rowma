import express from "express";
import cors from "cors";
import socketio from "socket.io";
import _ from "lodash";

const app = express();
const server = require("http").Server(app);
const io = socketio(server);

import Robot from "./domain/robot";
import Device from "./domain/device";
import WSResponse from "./response";

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

io.of("/conn_device").on("connection", socket => {
  // From ROS
  socket.on("register_robot", (payload: string, ack: Function = _.noop) =>
    registerRobot(db, socket, payload, ack)
  );
  socket.on("update_rosnodes", (payload: string, ack: Function = _.noop) =>
    updateRosnodes(db, payload, ack)
  );
  socket.on("disconnect", () => db.removeRobot(socket.id));
  socket.on("topic_from_ros", (payload: string, ack: Function = _.noop) =>
    topicFromRos(db, socket, payload, ack)
  );

  // From Device
  socket.on("register_device", (payload: string, ack: Function = _.noop) =>
    registerDevice(db, socket, payload, ack)
  );
  socket.on("run_launch", (payload: string, ack: Function = _.noop) =>
    runLaunch(db, socket, payload, ack)
  );
  socket.on("run_rosrun", (payload: string, ack: Function = _.noop) =>
    runRosrun(db, socket, payload, ack)
  );
  socket.on("delegate", (payload: string, ack: Function = _.noop) =>
    delegate(db, socket, payload, ack)
  );
  socket.on("kill_rosnodes", (payload: string, ack: Function = _.noop) =>
    killRosnode(db, socket, payload, ack)
  );
});

// Note: https://blog.fullstacktraining.com/cannot-redeclare-block-scoped-variable-name/
export {};
