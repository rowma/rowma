import Robot from "../entity/robot";
import Device from "../entity/device";

export default interface DatabaseInterface {
  getAllConnectedRobots(networkName: string): Promise<Array<Robot>>;
  getAllDevices(): Promise<Array<Device>>;
  findRobotByUuid(uuid: string): Promise<Robot>;
  findDeviceByUuid(uuid: string): Promise<Robot>;
  saveRobot(robot: Robot): Promise<boolean>;
  removeRobot(socketId: string): Promise<boolean>;
  saveDevice(device: Device): Promise<boolean>;
  getAllDevicesByUuids(uuids: Array<string>): Promise<Array<Device>>;
  updateRobotRosnodes(uuid: string, rosnodes: Array<string>, rostopics: Array<string>): Promise<boolean>;
  removeCurrentRobotConnections(): Promise<boolean>;
}
