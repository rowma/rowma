import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Device from "../entity/device";

export default class InmemoryDatabase implements DatabaseInterface {
  robotInmemoryDatabase: Array<Robot>;
  deviceInmemoryDatabase: Array<Device>;

  // Initialize db (session)
  constructor(robotDb: Array<Robot>, deviceDb: Array<Device>) {
    this.robotInmemoryDatabase = robotDb;
    this.deviceInmemoryDatabase = deviceDb;
  }

  getAllRobots(): Array<Robot> {
    return this.robotInmemoryDatabase;
  }

  getAllDevices(): Array<Device> {
    return this.deviceInmemoryDatabase;
  }

  findRobotByUuid(uuid: string): Robot {
    const robot = _.find(this.robotInmemoryDatabase, r => {
      return _.get(r, "uuid") === uuid;
    });

    return robot;
  }

  saveRobot(robot: Robot): boolean {
    try {
      this.robotInmemoryDatabase.push(robot);
      return true;
    } catch {
      return false;
    }
  }

  removeRobot(socketId: string): boolean {
    try {
      const index = _.findIndex(this.robotInmemoryDatabase, (robot: Robot) => {
        return _.get(robot, "socketId") === socketId;
      });
      delete this.robotInmemoryDatabase[index];
      this.robotInmemoryDatabase = _.compact(this.robotInmemoryDatabase);
      return true;
    } catch {
      return false;
    }
  }

  saveDevice(device): boolean {
    try {
      this.deviceInmemoryDatabase.push(device);
      return true;
    } catch {
      return false;
    }
  }

  getAllDevicesByRobotUuid(uuid: string): Array<Device> {
    const devices = _.filter(this.deviceInmemoryDatabase, (device: Device) => {
      return device.robotUuid === uuid;
    });
    return devices;
  }

  // TODO: Confirm if this method really work correctly
  updateRobotRosnodes(uuid: string, rosnodes: Array<string>): boolean {
    try {
      const robot = this.findRobotByUuid(uuid);
      robot.rosnodes = rosnodes;
      return true;
    } catch {
      return false;
    }
  }
}
