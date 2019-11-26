import Robot from "../domain/robot";
import Device from "../domain/device";
import WSResponse from "../response";

import DatabaseInterface from "../db/database-interface";

import _ from "lodash";

const createSuccessResponse = (data = ""): WSResponse => {
  return new WSResponse("success", data, "");
};

const createErrorResponse = (error = ""): WSResponse => {
  return new WSResponse("failed", "", error);
};

// const authorization = (id: string, teamName: string, action: string) => {
//   const authorizator = process.env.AUTHORIZATOR || '';
//   return await axios.get(`$authorizator}?id=${id}&team=${teamName}&action=${action}`);
//   // { success: true/false }
// }

const registerDevice = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  if (!payload) return;
  const robotUuid = _.get(payload, "robotUuid");
  const robot = db.findRobotByUuid(robotUuid);

  if (!robot) return; // TODO some handling
  const device = new Device(payload["deviceUuid"], socket.id, robot.uuid);
  db.saveDevice(device);

  console.log(db.getAllDevices());

  const response = createSuccessResponse();
  ack(response);
};

const runLaunch = (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any
): void => {
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);

  socket
    .to(robot.socketId)
    .emit("run_launch", { socketId: robot.socketId, command: payload.command });

  const response = createSuccessResponse();
  ack(response);
};

const runRosrun = (
  db: DatabaseInterface,
  socket: any,
  payload: any,
  ack: any
): void => {
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);
  console.log(payload);

  socket.to(robot.socketId).emit("run_rosrun", {
    socketId: robot.socketId,
    command: payload.command,
    args: payload.args
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
  payload: string,
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
