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

  getAllConnectedRobots(): Promise<Array<Robot>> {
    return new Promise<Array<Robot>>((resolve, reject) => {
      resolve(_.filter(this.robotInmemoryDatabase, { disconnectedAt: null }));
    });
  }

  getAllDevices(): Promise<Array<Device>> {
    return new Promise<Array<Device>>((resolve, reject) => {
      resolve(this.deviceInmemoryDatabase);
    });
  }

  findRobotByUuid(uuid: string): Promise<Robot> {
    const robot = _.find(this.robotInmemoryDatabase, r => {
      return _.get(r, "uuid") === uuid;
    });

    return new Promise((resolve, reject) => {
      resolve(robot);
    });
  }

  findDeviceByUuid(uuid: string): Promise<Robot> {
    const robot = _.find(this.deviceInmemoryDatabase, r => {
      return _.get(r, "uuid") === uuid;
    });

    return new Promise((resolve, reject) => {
      resolve(robot);
    });
  }

  saveRobot(robot: Robot): Promise<boolean> {
    // TODO: Use then - catch in promise
    try {
      this.robotInmemoryDatabase.push(robot);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  removeRobot(socketId: string): Promise<boolean> {
    // TODO: Use then - catch in promise
    try {
      const index = _.findIndex(this.robotInmemoryDatabase, (robot: Robot) => {
        return _.get(robot, "socketId") === socketId;
      });
      delete this.robotInmemoryDatabase[index];
      this.robotInmemoryDatabase = _.compact(this.robotInmemoryDatabase);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  saveDevice(device): Promise<boolean> {
    try {
      this.deviceInmemoryDatabase.push(device);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  getAllDevicesByUuids(uuids: Array<string>): Promise<Array<Device>> {
    const devices = _.filter(this.deviceInmemoryDatabase, (device: Device) => {
      return _.includes(uuids, device.uuid);
    });
    return new Promise(resolve => resolve(devices));
  }

  // TODO: Confirm if this method really work correctly
  // TODO: Change interface like updateRobotRosnodes(uuid: string, newRobot: Robot)
  updateRobotRosnodes(uuid: string, rosnodes: Array<string>, rostopics: Array<string>): Promise<boolean> {
    try {
      this.findRobotByUuid(uuid).then(robot => {
        robot.rosnodes = rosnodes;
        robot.rostopics = rostopics;
      });
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  removeCurrentRobotConnections(): Promise<boolean> {
    return new Promise(resolve => resolve(true));
  }
}
