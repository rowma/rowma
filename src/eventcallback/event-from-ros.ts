import Robot from "../domain/robot";
import WSResponse from "../response";

import DatabaseInterface from "../db/database-interface";

import _ from "lodash";

const createSuccessResponse = (data = ""): WSResponse => {
  return new WSResponse("success", data, "");
};

const createErrorResponse = (error = ""): WSResponse => {
  return new WSResponse("failed", "", error);
};

// TODO: Create Payload type
const registerRobot = (
  db: DatabaseInterface,
  socket: any,
  payload: string,
  ack: any
): void => {
  if (!payload) {
    const msg = "Payload must be included.";
    const response = createErrorResponse(msg);
    if (ack) ack(response);
    return;
  }

  const parsedPayload = JSON.parse(payload);
  const robot = new Robot(
    parsedPayload["uuid"],
    socket.id,
    parsedPayload["launch_commands"],
    parsedPayload["rosnodes"],
    parsedPayload["rosrun_commands"]
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
