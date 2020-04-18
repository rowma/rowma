import Robot from "../entity/robot";
import Device from "../entity/device";
import CommandLog from "../entity/command-log";

export default interface DatabaseInterface {
  getAllRobots(networkUuid: string): Promise<Array<Robot>>;
  getAllDevices(): Promise<Array<Device>>;
  findRobotByUuid(uuid: string): Promise<Robot>;
  findDeviceByUuid(uuid: string): Promise<Robot>;
  upsertRobot(robot: Robot): Promise<boolean>;
  removeRobot(socketId: string): Promise<boolean>;
  saveDevice(device: Device): Promise<boolean>;
  getAllDevicesByUuids(uuids: Array<string>): Promise<Array<Device>>;
  updateRobotRosnodes(robot: Robot): Promise<boolean>;
  removeCurrentRobotConnections(): Promise<boolean>;
  deleteRobot(uuid: string): Promise<boolean>;
  deleteApplication(socketId: string): Promise<boolean>;
  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Device>>;
  saveLog(log: CommandLog): Promise<boolean>;
}
