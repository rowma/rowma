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

const registerDevice = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  if (_.isEmpty(payload)) {
    const msg = "Payload must be included.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }
  const robotUuid = _.get(payload, "robotUuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) { // TODO some handling
    const msg = "The robot is not found.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }
  const device = new Device(payload["deviceUuid"], socket.id, robot.uuid);
  db.saveDevice(device);

  console.log(db.getAllDevices());

  const response = createSuccessResponse();
  ack(response);
};

const runLaunch = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const msg = "The robot is not found.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  socket
    .to(robot.socketId)
    .emit("run_launch", { socketId: robot.socketId, command: _.get(payload, 'command') });

  const response = createSuccessResponse();
  ack(response);
};

const runRosrun = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);
  console.log(payload);

  socket.to(robot.socketId).emit("run_rosrun", {
    socketId: robot.socketId,
    command: _.get(payload, 'command'),
    args: _.get(payload, 'args')
  });

  const response = createSuccessResponse();
  ack(response);
};

// TODO: Change name
const delegate = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  const robotUuid = _.get(payload, "robotUuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) {
    const msg = "robot not found.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  socket.to(robot.socketId).emit("rostopic", _.get(payload, "msg"));

  const response = createSuccessResponse();
  ack(response);
};

const killRosnode = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  socket.to(robot.socketId).emit("kill_rosnodes", {
    socketId: robot.socketId,
    rosnodes: _.get(payload, "rosnodes")
  });

  const response = createSuccessResponse();
  ack(response);
};

export { registerDevice, runLaunch, runRosrun, delegate, killRosnode };
