import Robot from "../entity/robot";
import Device from "../entity/device";

export default interface DatabaseInterface {
  getAllRobots(): Promise<Array<Robot>>;
  getAllDevices(): Promise<Array<Device>>;
  findRobotByUuid(uuid: string): Promise<Robot>;
  saveRobot(robot: Robot): Promise<boolean>;
  removeRobot(socketId: string): Promise<boolean>;
  saveDevice(device: Device): Promise<boolean>;
  getAllDevicesByRobotUuid(uuid: string): Promise<Array<Device>>;
  updateRobotRosnodes(uuid: string, rosnodes: Array<string>): Promise<boolean>;
}
