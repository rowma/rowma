// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when code.

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

const registerDevice = async (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const robotUuid = _.get(payload, "robotUuid");
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) { // TODO some handling
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }
  const device = new Device(payload["deviceUuid"], socket.id, robot.uuid);
  db.saveDevice(device);

  console.log(db.getAllDevices());

  const response = createSuccessResponse();
  ack(response);
};

const runLaunch = async (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any,
  robotNsp: any
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(payload, "uuid");
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp
    .to(robot.socketId)
    .emit("run_launch", { socketId: robot.socketId, command: _.get(payload, 'command') });

  const response = createSuccessResponse();
  ack(response);
};

const runRosrun = async (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any,
  robotNsp: any
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(payload, "uuid");
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("run_rosrun", {
    socketId: robot.socketId,
    command: _.get(payload, 'command'),
    args: _.get(payload, 'args')
  });

  const response = createSuccessResponse();
  ack(response);
};

// TODO: Change name
const delegate = async (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any,
  robotNsp: any
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  // TODO: Change the key name from robotUuid to uuid
  const robotUuid = _.get(payload, "robotUuid");
  const robot = await db.findRobotByUuid(robotUuid);

  if (!robot) {
    const response = createErrorResponse(ROBOT_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  robotNsp.to(robot.socketId).emit("rostopic", _.get(payload, "msg"));

  const response = createSuccessResponse();
  ack(response);
};

const killRosnode = async (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any,
  robotNsp: any
): Promise<void> => {
  if (_.isEmpty(payload)) {
    const response = createErrorResponse(PAYLOAD_NOT_FOUND_MSG);
    if (ack) ack(response);
    return;
  }

  const robotUuid = _.get(payload, "uuid");
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

export { registerDevice, runLaunch, runRosrun, delegate, killRosnode };
