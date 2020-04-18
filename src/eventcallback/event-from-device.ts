// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when code.

import Robot from "../entity/robot";
import Device from "../entity/device";

import * as socketio from "socket.io";

import { createSuccessResponse, createErrorResponse } from "../lib/response";

import DatabaseInterface from "../db/database-interface";

import _ from "lodash";

const ROBOT_NOT_FOUND_MSG = "The robot is not found.";
const PAYLOAD_NOT_FOUND_MSG = "Payload must be included.";

const registerDevice = async (
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
  const device = new Device(payload["deviceUuid"], socket.id, payload["robotUuid"]);
  db.saveDevice(device);

  console.log(db.getAllDevices());

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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("run_launch", {
    socketId: robot.socketId,
    command: _.get(payload, "command")
  });

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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("run_rosrun", {
    socketId: robot.socketId,
    command: _.get(payload, "command"),
    args: _.get(payload, "args")
  });

  const response = createSuccessResponse();
  ack(response);
};

// TODO: Change name
const delegate = async (
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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  // TODO: Remove unnecessary values
  robotNsp.to(robot.socketId).emit("rostopic", _.get(payload, "msg"));

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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("kill_rosnodes", {
    socketId: robot.socketId,
    rosnodes: _.get(payload, "rosnodes")
  });

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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("unsubscribe_rostopic", {
    socketId: robot.socketId,
    topic: _.get(payload, "topic")
  });

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
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("add_script", {
    socketId: robot.socketId,
    script: _.get(payload, "script"),
    name: _.get(payload, "name")
  });

  const response = createSuccessResponse();
  ack(response);
};

export {
  registerDevice,
  runLaunch,
  runRosrun,
  delegate,
  killRosnode,
  unsubscribeRostopic,
  addScript
};
