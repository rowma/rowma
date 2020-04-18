import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Device from "../entity/device";
import CommandLog from "../entity/command-log";

export default class InmemoryDatabase implements DatabaseInterface {
  robotInmemoryDatabase: Array<Robot>;
  deviceInmemoryDatabase: Array<Device>;
  commandLogInmemoryDatabase: Array<CommandLog>;

  // Initialize db (session)
  constructor(robotDb: Array<Robot>, deviceDb: Array<Device>, logDb: Array<CommandLog>) {
    this.robotInmemoryDatabase = robotDb;
    this.deviceInmemoryDatabase = deviceDb;
    this.commandLogInmemoryDatabase = logDb;
  }

  getAllRobots(networkUuid: string): Promise<Array<Robot>> {
    return new Promise<Array<Robot>>((resolve, reject) => {
      resolve(
        _.filter(this.robotInmemoryDatabase, {
          networkUuid,
          disconnectedAt: null
        })
      );
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

  upsertRobot(robot: Robot): Promise<boolean> {
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

  updateRobotRosnodes(robot: Robot): Promise<boolean> {
    try {
      const index = _.findIndex(this.robotInmemoryDatabase, (r) => r.uuid == robot.uuid);
      _.update(this.robotInmemoryDatabase, `[${index}]`, () => robot);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  removeCurrentRobotConnections(): Promise<boolean> {
    return new Promise(resolve => resolve(true));
  }

  deleteRobot(uuid: string): Promise<boolean> {
    return new Promise(resolve => {
      try {
        _.remove(
          this.robotInmemoryDatabase,
          (robot: Robot) => {
            return robot.uuid === uuid;
          }
        );
        return resolve(true);
      } catch {
        return resolve(false);
      }
    });
  }

  deleteApplication(socketId: string): Promise<boolean> {
    return new Promise(resolve => {
      try {
        _.remove(
          this.deviceInmemoryDatabase,
          (device: Device) => {
            return device.socketId === socketId;
          }
        );
        return resolve(true);
      } catch {
        return resolve(false);
      }
    });
  }

  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Device>> {
    const devices = _.filter(this.deviceInmemoryDatabase, (device: Device) => {
      return device.robotUuid = robotUuid;
    });
    return new Promise(resolve => resolve(devices));
  }

  saveLog(log: CommandLog): Promise<boolean> {
    try {
      this.commandLogInmemoryDatabase.push(log);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }
}
