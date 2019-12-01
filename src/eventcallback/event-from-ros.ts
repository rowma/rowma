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
  payload: object,
  ack: any
): Promise<any> => {
  if (!payload) {
    const msg = "Payload must be included.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  // generate uuid
  let uuid = genUuid();
  const payloadUuid = payload["uuid"];
  if (payloadUuid) {
    const robot = db.findRobotByUuid(payloadUuid);
    if (robot) {
      const msg = "The UUID is already in use";
      const response = createErrorResponse(msg);
      socket.emit("err", response);
      return;
    } else {
      uuid = payloadUuid;
    }
  }
  socket.emit("robot_registered", { uuid });

  let projectName = "default";
  // Authenticat api_key from rowma_ros
  const apiKey = payload["api_key"];
  if (apiKey) {
    const authResult = await authenticateRobot(apiKey);
    if (authResult.auth) {
      projectName = authResult.projectName;
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
    payload["launch_commands"],
    payload["rosnodes"],
    payload["rosrun_commands"],
    projectName
  );
  db.saveRobot(robot);
  console.log("registered: ", db.getAllRobots());
};

const updateRosnodes = (
  db: DatabaseInterface,
  payload: object,
  ack: any
): void => {
  if (!payload) return;
  const robotUuid = _.get(payload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);
  console.log(payload);
  const rosnodes = _.get(payload, "rosnodes") || [];
  db.updateRobotRosnodes(robotUuid, rosnodes);

  console.log("registered: ", db.getAllRobots());
};

const topicFromRos = (
  db: DatabaseInterface,
  socket: any,
  payload: object,
  ack: any
): void => {
  const robotUuid = _.get(payload, "robotUuid");
  const devices = db.getAllDevicesByRobotUuid(robotUuid);
  _.each(devices, device => {
    _.each(_.get(payload, "deviceUuids"), payloadDeviceUuid => {
      if (device.uuid == payloadDeviceUuid) {
        socket.to(device.socketId).emit("topic_to_device", payload);
      }
    });
  });

  const response = createSuccessResponse();
  ack(response);
};

export { registerRobot, updateRosnodes, topicFromRos };
