// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when I write code.

import Robot from "../entity/robot";
import Device from "../entity/device";

import {
  createSuccessResponse,
  createErrorResponse
} from "../lib/response";

import DatabaseInterface from "../db/database-interface";

import _ from "lodash";

const ROBOT_NOT_FOUND_MSG = "The robot is not found."
const PAYLOAD_NOT_FOUND_MSG = "Payload must be included."

const registerDevice = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (_.isEmpty(parsedPayload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const robotUuid = _.get(parsedPayload, "robotUuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) { // TODO some handling
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const device = new Device(parsedPayload["deviceUuid"], socket.id, robot.uuid);
  db.saveDevice(device);

  console.log(db.getAllDevices());

  const response = createSuccessResponse();
  ack(response);
};

const runLaunch = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (_.isEmpty(parsedPayload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  socket
    .to(robot.socketId)
    .emit("run_launch", { socketId: robot.socketId, command: _.get(parsedPayload, 'command') });

  const response = createSuccessResponse();
  ack(response);
};

const runRosrun = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (_.isEmpty(parsedPayload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  socket.to(robot.socketId).emit("run_rosrun", {
    socketId: robot.socketId,
    command: _.get(parsedPayload, 'command'),
    args: _.get(parsedPayload, 'args')
  });

  const response = createSuccessResponse();
  ack(response);
};

// TODO: Change name
const delegate = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (_.isEmpty(parsedPayload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  // TODO: Change the key name from robotUuid to uuid
  const robotUuid = _.get(parsedPayload, "robotUuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  socket.to(robot.socketId).emit("rostopic", _.get(parsedPayload, "msg"));

  const response = createSuccessResponse();
  ack(response);
};

const killRosnode = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (_.isEmpty(parsedPayload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  socket.to(robot.socketId).emit("kill_rosnodes", {
    socketId: robot.socketId,
    rosnodes: _.get(parsedPayload, "rosnodes")
  });

  const response = createSuccessResponse();
  ack(response);
};

export { registerDevice, runLaunch, runRosrun, delegate, killRosnode };
