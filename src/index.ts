import express from "express";
import cors from "cors";
import socketio from "socket.io";
import _ from "lodash";
import process from "process";

const app = express();
const server = require("http").Server(app);
const io = socketio(server, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, networkId, networkUuid, apiKey",
      "Access-Control-Allow-Origin": req.headers.origin,
      "Access-Control-Allow-Credentials": true
    };
    res.writeHead(200, headers);
    res.end();
  }
});

const rowmaNsp = io.of("/rowma");

import Robot from "./entity/robot";
import Application from "./entity/application";
import NetworkInformation from "./entity/network-information";
import CommandLog from "./entity/command-log";

import {
  registerRobot,
  updateRosnodes,
  topicFromRos,
  roslaunchLog,
  rosrunLog
} from "./eventcallback/event-from-ros";

import {
  registerApplication,
  runLaunch,
  runRosrun,
  topicTransfer,
  killRosnode,
  unsubscribeRostopic,
  addScript,
  updateApplication
} from "./eventcallback/event-from-application";

import { authenticateApplication } from "./auth";
import { authorizeApplication } from "./auth";

import DatabaseInterface from "./db/database-interface";
import inmemoryDb from "./db/inmemory-database";
import mongodb from "./db/mongodb";
import * as mongodbConnection from "./lib/mongo-connection";

import {
  NETWORK_NAME,
  NETWORK_TYPE,
  NETWORK_LOCATION,
  NETWORK_OWNER,
  ROWMA_VERSION,
  DATABASE,
  PORT,
  AUTHENTICATOR_URL
} from "./lib/settings";

let db: DatabaseInterface;

if (DATABASE === "inmemory") {
  const robotInmemoryDatabase: Array<Robot> = [];
  const applicationInmemoryDatabase: Array<Application> = [];
  const commandLogInmemoryDatabase: Array<CommandLog> = [];
  db = new inmemoryDb(
    robotInmemoryDatabase,
    applicationInmemoryDatabase,
    commandLogInmemoryDatabase
  );
} else {
  mongodbConnection.connect().then(() => {
    db = new mongodb(mongodbConnection);
  });
}

const information = {
  name: NETWORK_NAME,
  type: NETWORK_TYPE,
  location: NETWORK_LOCATION,
  owner: NETWORK_OWNER,
  version: ROWMA_VERSION
};
const network = new NetworkInformation(information);

server.listen(PORT);
app.use(cors());

app.get("/list_connections", async (req, res) => {
  const action = "list_connections";
  if (AUTHENTICATOR_URL) {
    const { authz } = await authorizeApplication(
      req.headers["authorization"],
      req.headers["apikey"],
      req.query.uuid,
      action
    );

    if (!authz) {
      res.writeHead(403);
      res.write(JSON.stringify({ msg: "You cannot execute the action." }));
      res.end();
      return;
    }
  }

  res.writeHead(200);
  const networkUuid = req.query.uuid || "default";
  const allRobots = await db.getAllRobots(networkUuid);
  res.write(JSON.stringify(allRobots));
  res.end();
});

app.get("/robots", async (req, res) => {
  const action = "robots";
  if (AUTHENTICATOR_URL) {
    const { authz } = await authorizeApplication(
      req.headers["authorization"],
      req.headers["apikey"],
      req.query.networkUuid,
      action
    );

    if (!authz) {
      res.writeHead(403);
      res.write(JSON.stringify({ msg: "You cannot execute the action." }));
      res.end();
      return;
    }
  }

  const robotUuid = _.get(req, "query.uuid");
  const robot = await db.findOneRobotByUuid(robotUuid);

  res.writeHead(200);
  res.write(JSON.stringify(robot || {}));
  res.end();
});

app.delete("/robots/:uuid", async (req, res) => {
  const action = "delete_robot";
  if (AUTHENTICATOR_URL) {
    const { authz } = await authorizeApplication(
      req.headers["authorization"],
      req.headers["apikey"],
      req.query.networkUuid,
      action
    );

    if (!authz) {
      res.writeHead(403);
      res.write(JSON.stringify({ msg: "You cannot execute the action." }));
      res.end();
      return;
    }
  }

  const robotUuid = _.get(req, "params.uuid");
  await db.deleteRobot(robotUuid);

  res.writeHead(200);
  res.end();
});

app.get("/network_information", (req, res) => {
  res.writeHead(200);
  res.write(JSON.stringify(network || {}));
  res.end();
});

app.get("/", async (_req, res) => {
  res.writeHead(200);
  res.write(JSON.stringify({ msg: "success!" }));
  res.end();
});

const robotEventHandlers = (socket, applicationNsp) => {
  // From ROS
  socket.on("register_robot", (payload: any, ack: Function = _.noop) =>
    registerRobot(db, socket, payload, ack)
  );
  socket.on("update_rosnodes", (payload: any, ack: Function = _.noop) =>
    updateRosnodes(db, payload, ack)
  );
  socket.on("disconnect", () => db.removeRobot(socket.id));
  socket.on("topic_from_ros", (payload: any, ack: Function = _.noop) =>
    topicFromRos(db, socket, payload, ack, applicationNsp)
  );
  socket.on("roslaunch_log", (payload: any, ack: Function = _.noop) =>
    roslaunchLog(db, socket, payload, ack, applicationNsp)
  );
  socket.on("rosrun_log", (payload: any, ack: Function = _.noop) =>
    rosrunLog(db, socket, payload, ack, applicationNsp)
  );
};

const handlerWithAuth = (
  socket: socketio.Socket,
  eventName: string,
  handler: Function
) => {
  socket.on(eventName, async (payload: any, ack: Function = _.noop) => {
    if (AUTHENTICATOR_URL) {
      const { authz } = await authorizeApplication(
        socket.handshake.headers["authorization"],
        socket.handshake.headers["apikey"],
        socket.handshake.headers["networkuuid"],
        eventName
      );
      if (!authz) {
        const authzMsg = "You are not authorized.";
        socket.emit("unauthorized", authzMsg);
        return;
      }
    }

    handler(payload, ack);
  });
};

const applicationEventHandlers = (socket, robotNsp) => {
  // From Application
  handlerWithAuth(
    socket,
    "register_application",
    (payload: any, ack: Function = _.noop) =>
      registerApplication(db, socket, payload, ack)
  );
  handlerWithAuth(
    socket,
    "run_launch",
    (payload: any, ack: Function = _.noop) =>
      runLaunch(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(
    socket,
    "run_rosrun",
    (payload: any, ack: Function = _.noop) =>
      runRosrun(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(socket, "topic_transfer", (payload: any, ack: Function = _.noop) => {
    console.log(payload)
    topicTransfer(db, socket, payload, ack, robotNsp)
  });
  handlerWithAuth(
    socket,
    "kill_rosnodes",
    (payload: any, ack: Function = _.noop) =>
      killRosnode(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(
    socket,
    "unsubscribe_rostopic",
    (payload: any, ack: Function = _.noop) =>
      unsubscribeRostopic(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(socket, "disconnect", () => db.deleteApplication(socket.id));
  handlerWithAuth(
    socket,
    "add_script",
    (payload: any, ack: Function = _.noop) =>
      addScript(db, socket, payload, ack, robotNsp)
  );
  handlerWithAuth(
    socket,
    "update_application",
    (payload: any, ack: Function = _.noop) =>
      updateApplication(db, socket, payload, ack)
  );
};

const eventHandlers = socket => {
  robotEventHandlers(socket, rowmaNsp);
  applicationEventHandlers(socket, rowmaNsp);
};

const applicationNsp = io.of("/rowma_application");
const robotNsp = io.of("/rowma_robot");

applicationNsp.on("connection", socket => {
  console.log("connected");
  applicationEventHandlers(socket, robotNsp);
});

robotNsp.on("connection", socket => {
  robotEventHandlers(socket, applicationNsp);
});

rowmaNsp.on("connection", socket => {
  eventHandlers(socket);
});

server.on("close", async () => {
  console.log("Stopping ...");
  // TODO: Consider removing application connections
  await db.removeCurrentRobotConnections();
  process.exit(1);
});

process.on("SIGINT", function() {
  server.close();
});

// Note: https://blog.fullstacktraining.com/cannot-redeclare-block-scoped-variable-name/
export {};
