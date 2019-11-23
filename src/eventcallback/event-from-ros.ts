import Robot from "../domain/robot";
import WSResponse from "../response";

import DatabaseInterface from "../db/database-interface";

import { authenticate } from "../auth";

import _ from "lodash";
import genUuid from "uuid";

const createSuccessResponse = (data = ""): WSResponse => {
  return new WSResponse("success", data, "");
};

const createErrorResponse = (error = ""): WSResponse => {
  return new WSResponse("failed", "", error);
};

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

// TODO: Create Payload type
const registerRobot = async (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): Promise<any> => {
  if (!payload) {
    const msg = "Payload must be included.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  const parsedPayload = JSON.parse(payload);

  // generate uuid
  let uuid = genUuid();
  const payloadUuid = parsedPayload["uuid"]
  if (payloadUuid) {
    const robot = db.findRobotByUuid(payloadUuid)
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
  const apiKey = parsedPayload["api_key"]
  if (apiKey) {
    const authResult = await authenticate(apiKey)
    if (authResult.success) {
      projectName = authResult.projectName
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
    projectName
  );
  db.saveRobot(robot);
  console.log("registered: ", db.getAllRobots());
};

const updateRosnodes = (
  db: DatabaseInterface,
  payload: string,
  ack: any
): void => {
  if (!payload) return;
  const parsedPayload = JSON.parse(payload);
  const robotUuid = _.get(parsedPayload, "uuid");
  const robot = db.findRobotByUuid(robotUuid);
  console.log(parsedPayload);
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
    _.each(_.get(parsedPayload, "deviceUuids"), payloadDeviceUuid => {
      if (device.uuid == payloadDeviceUuid) {
        socket.to(device.socketId).emit("topic_to_device", payload);
      }
    });
  });

  const response = createSuccessResponse();
  ack(response);
};

export { registerRobot, updateRosnodes, topicFromRos };
