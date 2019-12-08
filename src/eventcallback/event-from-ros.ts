// The role of this file is Controller in MVC architecture. These functions are responsible
// for response (ack() function). So keep in your mind that when I write code.

import Robot from "../entity/robot";

import {
  createSuccessResponse,
  createErrorResponse
} from "../lib/response";

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

  // generate uuid
  let uuid = genUuid();
  const parsedPayloadUuid = parsedPayload["uuid"];
  if (parsedPayloadUuid) {
    const robot = db.findRobotByUuid(parsedPayloadUuid);
    if (robot) {
      const msg = "The UUID is already in use";
      const response = createErrorResponse(msg);
      socket.emit("err", response);
      return;
    } else {
      uuid = parsedPayloadUuid;
    }
  }
  socket.emit("robot_registered", { uuid });

  let swarmName = "default";
  // Authenticat api_key from rowma_ros
  const apiKey = parsedPayload["api_key"];
  if (apiKey) {
    const authResult = await authenticateRobot(apiKey);
    if (authResult.auth) {
      swarmName = authResult.swarmName;
    } else {
      const msg = "Wrong API_KEY";
      const response = createErrorResponse(msg);
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
    swarmName
  );
  db.saveRobot(robot);
  console.log("registered: ", db.getAllRobots());
};

const updateRosnodes = (
  db: DatabaseInterface,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  if (!parsedPayload) return;
  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);
  const rosnodes = _.get(parsedPayload, "rosnodes") || [];
  db.updateRobotRosnodes(robotUuid, rosnodes);

  console.log("registered: ", db.getAllRobots());
};

const topicFromRos = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  const parsedPayload = JSON.parse(payload);
  const robotUuid = _.get(parsedPayload, "robotUuid");
  const devices = db.getAllDevicesByRobotUuid(robotUuid);
  _.each(devices, device => {
    _.each(_.get(parsedPayload, "deviceUuids"), parsedPayloadDeviceUuid => {
      if (device.uuid == parsedPayloadDeviceUuid) {
        socket.to(device.socketId).emit("topic_to_device", parsedPayload);
      }
    });
  });

  const response = createSuccessResponse();
  ack(response);
};

export { registerRobot, updateRosnodes, topicFromRos };
