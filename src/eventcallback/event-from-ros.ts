// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when I write code.

import Robot from "../entity/robot";

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
  socket.emit("robot_registered", { uuid });

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
  db.updateRobotRosnodes(robotUuid, rosnodes, rostopics);

  console.log("registered: ", db.getAllRobots(robot.networkUuid));
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

export { registerRobot, updateRosnodes, topicFromRos };
