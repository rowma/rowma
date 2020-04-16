import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Device from "../entity/device";

export default class Mongodb implements DatabaseInterface {
  db: any;

  // Initialize db (session)
  constructor(db: any) {
    this.db = db;
  }

  getAllRobots(networkUuid: string): Promise<Array<Robot>> {
    return this.db.collections.robots
      .find({ networkUuid })
      .toArray()
      .then(robots => {
        return robots;
      });
  }

  getAllDevices(): Promise<Array<Device>> {
    return this.db.collections.devices
      .find()
      .toArray()
      .then(devices => {
        return devices;
      });
  }

  findRobotByUuid(uuid: string): Promise<Robot> {
    return this.db.collections.robots.findOne({ uuid: uuid });
  }

  findDeviceByUuid(uuid: string): Promise<Robot> {
    return this.db.collections.devices.findOne({ uuid: uuid });
  }

  upsertRobot(robot: Robot): Promise<boolean> {
    // Insert if a robot of robot.uuid does not exists
    // Update if a robot of robot.uuid exists
    return this.db.collections.robots.updateOne(
      { uuid: robot.uuid },
      { $set: { ...robot, disconnectedAt: null } },
      { upsert: true }
    );
  }

  removeRobot(socketId: string): Promise<boolean> {
    return this.db.collections.robots
      .findOneAndUpdate({ socketId }, { $set: { disconnectedAt: new Date() } })
      .then(res => {
        // TODO: More sophisticated return value
        return true;
      })
      .catch(e => {
        return false;
      });
  }

  saveDevice(device): Promise<boolean> {
    return this.db.collections.devices.insertOne(device).then(res => {
      return new Promise(resolve => resolve(true));
    });
  }

  getAllDevicesByUuids(uuids: Array<string>): Promise<Array<Device>> {
    return this.db.collections.devices.find({ robotUuid: uuids });
  }

  // TODO: Confirm if this method really work correctly
  // TODO: Implement.
  updateRobotRosnodes(
    uuid: string,
    rosnodes: Array<string>,
    rostopics: Array<string>
  ): Promise<boolean> {
    return new Promise(resolve => resolve(true));
  }

  removeCurrentRobotConnections(): Promise<boolean> {
    return this.db.collections.robots
      .updateMany(
        { query: { $ne: { disconnectedAt: null } } },
        { $set: { disconnectedAt: new Date() } }
      )
      .then(() => {
        return new Promise(resolve => resolve(true));
      })
      .catch(err => {
        console.log(err);
        return new Promise(resolve => resolve(false));
      });
  }

  deleteRobot(uuid: string): Promise<boolean> {
    return this.db.collections.robots
      .deleteOne({ uuid })
      .then(() => {
        return new Promise(resolve => resolve(true));
      })
      .catch(err => {
        return new Promise(resolve => resolve(false));
      });
  }

  deleteApplication(socketId: string): Promise<boolean> {
    return this.db.collections.devices
      .deleteOne({ socketId })
      .then(() => {
        return new Promise(resolve => resolve(true));
      })
      .catch(err => {
        return new Promise(resolve => resolve(false));
      });
  }

  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Device>> {
    return this.db.collections.devices.find({ robotUuid });
  }
}
