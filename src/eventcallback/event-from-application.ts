// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when code.

import Robot from "../entity/robot";
import Application from "../entity/application";

import * as socketio from "socket.io";

import { createSuccessResponse, createErrorResponse } from "../lib/response";

import DatabaseInterface from "../db/database-interface";

import _ from "lodash";

const ROBOT_NOT_FOUND_MSG = "The robot is not found.";
const PAYLOAD_NOT_FOUND_MSG = "Payload must be included.";

const registerApplication = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const application = new Application(
    payload["applicationUuid"],
    socket.id,
    payload["robotUuid"]
  );
  db.saveApplication(application);

  console.log(db.getAllApplications());

  const response = createSuccessResponse();
  ack(response);
};

const runLaunch = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    robotNsp.to(robot.socketId).emit("run_launch", {
      socketId: robot.socketId,
      command: _.get(payload, "command")
    });
  })

  const response = createSuccessResponse();
  ack(response);
};

const runRosrun = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    robotNsp.to(robot.socketId).emit("run_rosrun", {
      socketId: robot.socketId,
      command: _.get(payload, "command"),
      args: _.get(payload, "args")
    });
  })

  const response = createSuccessResponse();
  ack(response);
};

// TODO: Change name
const topicTransfer = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    // TODO: Remove unnecessary values
    robotNsp.to(robot.socketId).emit("rostopic", _.get(payload, "msg"));
  })

  const response = createSuccessResponse();
  ack(response);
};

const killRosnode = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    robotNsp.to(robot.socketId).emit("kill_rosnodes", {
      socketId: robot.socketId,
      rosnodes: _.get(payload, "rosnodes")
    });
  })

  const response = createSuccessResponse();
  ack(response);
};

const unsubscribeRostopic = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    robotNsp.to(robot.socketId).emit("unsubscribe_rostopic", {
      socketId: robot.socketId,
      topic: _.get(payload, "topic")
    });
  })

  const response = createSuccessResponse();
  ack(response);
};

const addScript = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function,
  robotNsp: socketio.Socket
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const destination = _.get(payload, "destination");
  const robotUuid = _.get(destination, "uuid");
  const robots = await db.findRobotsByUuidRegx(robotUuid);

  if (robots.length === 0) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robots.forEach((robot: Robot) => {
    robotNsp.to(robot.socketId).emit("add_script", {
      socketId: robot.socketId,
      script: _.get(payload, "script"),
      name: _.get(payload, "name")
    });
  })

  const response = createSuccessResponse();
  ack(response);
};

const updateApplication = async (
  db: DatabaseInterface,
  socket: socketio.Socket,
  payload: any,
  ack: Function
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const application = await db.findApplicationByUuid(payload["uuid"])
  const newApplication = new Application(payload["uuid"], application.socketId, payload["robotUuid"])
  db.updateApplication(newApplication)

  const response = createSuccessResponse();
  ack(response);
};

export {
  registerApplication,
  runLaunch,
  runRosrun,
  topicTransfer,
  killRosnode,
  unsubscribeRostopic,
  addScript,
  updateApplication
};
