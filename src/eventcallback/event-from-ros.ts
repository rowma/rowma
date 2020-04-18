// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when I write code.

import Robot from "../entity/robot";
import Device from "../entity/device";
import CommandLog from "../entity/command-log";

import { createSuccessResponse, createErrorResponse } from "../lib/response";

import DatabaseInterface from "../db/database-interface";

import { authenticateRobot } from "../auth";

import _ from "lodash";
import genUuid from "uuid";

// TODO: Create Payload type
const registerRobot = async (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): Promise<any> => {
  const parsedPayload = JSON.parse(payload);
  if (!parsedPayload) {
    const msg = "Payload must be included.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  const REQUIRED_ROWMA_ROS_VERSION = "0.0.0"; // TODO: Move this variable to constant
  if (REQUIRED_ROWMA_ROS_VERSION > parsedPayload["rowma_ros_version"]) {
    const msg = "You need to update version " + REQUIRED_ROWMA_ROS_VERSION;
    const response = createErrorResponse(msg);
    socket.emit("err", response);
    return;
  }

  // generate uuid
  let uuid = genUuid();
  const parsedPayloadUuid = parsedPayload["uuid"];
  if (parsedPayloadUuid) {
    const robot = await db.findRobotByUuid(parsedPayloadUuid);
    if (
      !parsedPayload["reconnection"] &&
      robot &&
      robot.disconnectedAt === null
    ) {
      const msg = "The UUID is already in use";
      const response = createErrorResponse(msg);
      socket.emit("err", response);
      return;
    } else {
      uuid = parsedPayloadUuid;
    }
  }

  let networkUuid = "default";
  // Authenticat api_key from rowma_ros
  const apiKey = parsedPayload["api_key"];
  if (apiKey) {
    const authResult = await authenticateRobot(apiKey);
    if (authResult.auth) {
      networkUuid = authResult.networkUuid;
    } else {
      const msg = "Wrong API_KEY";
      const response = createErrorResponse(`${msg}: ${authResult.msg}`);
      socket.emit("err", response);
      return;
    }
  }

  const robot = new Robot(
    uuid,
    socket.id,
    parsedPayload["launch_commands"],
    parsedPayload["rosnodes"],
    parsedPayload["rosrun_commands"],
    parsedPayload["rostopics"],
    networkUuid
  );
  await db.upsertRobot(robot);
  socket.emit("robot_registered", { uuid });
  // const allRobots = await db.getAllRobots(networkUuid);
  // console.log("registered: ", allRobots);
};

const updateRosnodes = async (
  db: DatabaseInterface,
  payload: string,
  ack: any
): Promise<any> => {
  const parsedPayload = JSON.parse(payload);
  if (!parsedPayload) return;
  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = await db.findRobotByUuid(robotUuid);
  const rosnodes = _.get(parsedPayload, "rosnodes") || robot.rosnodes;
  const rostopics = _.get(parsedPayload, "rostopics") || robot.rostopics;
  const rosrunCommands = _.get(parsedPayload, "rosrunCommands") || robot.rosrunCommands;
  const newRobot = { ...robot, rosnodes, rostopics, rosrunCommands }
  db.updateRobotRosnodes(newRobot);
};

const topicFromRos = async (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any,
  nsp: any
): Promise<void> => {
  const parsedPayload = JSON.parse(payload);
  const topicDestination = _.get(parsedPayload, "topicDestination");
  const destType = topicDestination["type"];
  const isDestRobot = destType === "robot";
  const destination = isDestRobot
    ? await db.findRobotByUuid(topicDestination["uuid"])
    : await db.findDeviceByUuid(topicDestination["uuid"]);
  const eventName = isDestRobot ? "rostopic" : "topic_to_device";
  // Have to implement the event on your own application
  nsp.to(destination.socketId).emit(eventName, parsedPayload);

  const response = createSuccessResponse();
  ack(response);
};

const roslaunchLog = async (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any,
  nsp: any
): Promise<void> => {
  const parsedPayload = JSON.parse(payload);
  const applications = await db.findApplicationsByRobotUuid(parsedPayload["robotUuid"])
  applications.forEach((application: Device) => {
    nsp.to(application.socketId).emit("roslaunch_log", parsedPayload);
  })

  const log = new CommandLog(
    "roslaunch",
    parsedPayload["cmd"],
    parsedPayload["robotUuid"],
    parsedPayload["log"]
  )

  await db.saveLog(log)

  const response = createSuccessResponse();
  ack(response);
};

const rosrunLog = async (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any,
  nsp: any
): Promise<void> => {
  const parsedPayload = JSON.parse(payload);
  const applications = await db.findApplicationsByRobotUuid(parsedPayload["robotUuid"])
  applications.forEach((application: Device) => {
    nsp.to(application.socketId).emit("rosrun_log", parsedPayload);
  })

  const log = new CommandLog(
    "rosrun",
    parsedPayload["cmd"],
    parsedPayload["robotUuid"],
    parsedPayload["log"]
  )

  await db.saveLog(log)

  const response = createSuccessResponse();
  ack(response);
};

export { registerRobot, updateRosnodes, topicFromRos, roslaunchLog, rosrunLog };
