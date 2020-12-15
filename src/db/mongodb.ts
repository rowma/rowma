import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Application from "../entity/application";
import CommandLog from "../entity/command-log";

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

  getAllApplications(): Promise<Array<Application>> {
    return this.db.collections.applications
      .find()
      .toArray()
      .then(applications => {
        return applications;
      });
  }

  findOneRobotByUuid(uuid: string): Promise<Robot> {
    return this.db.collections.robots.findOne({ uuid: uuid });
  }

  findRobotsByUuidRegx(uuid: string): Promise<Array<Robot>> {
    return this.db.collections.robots
      .find({ uuid: { $regex: uuid, $options: "i" } })
      .toArray();
  }

  findApplicationByUuid(uuid: string): Promise<Application> {
    return this.db.collections.applications.findOne({ uuid: uuid });
  }

  findApplicationByUuidRegx(uuid: string): Promise<Array<Application>> {
    return this.db.collections.applications
      .find({ uuid: { $regex: uuid, $options: "i" } })
      .toArray();
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

  saveApplication(application): Promise<boolean> {
    return this.db.collections.applications.insertOne(application).then(res => {
      return new Promise(resolve => resolve(true));
    });
  }

  getAllApplicationsByUuids(uuids: Array<string>): Promise<Array<Application>> {
    return this.db.collections.applications.find({ robotUuid: uuids });
  }

  updateRobotRosnodes(robot: Robot): Promise<boolean> {
    console.log("updateRobotRosnodes ", robot);
    return this.db.collections.robots.updateOne(
      { uuid: robot.uuid },
      { $set: robot },
      { upsert: true }
    );
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
    return this.db.collections.applications
      .deleteOne({ socketId })
      .then(() => {
        return new Promise(resolve => resolve(true));
      })
      .catch(err => {
        return new Promise(resolve => resolve(false));
      });
  }

  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Application>> {
    return this.db.collections.applications.find({ robotUuid });
  }

  saveLog(log: CommandLog): Promise<boolean> {
    return this.db.collections.commandLogs.insertOne(log).then(res => {
      return new Promise(resolve => resolve(true));
    });
  }

  updateApplication(application: Application): Promise<boolean> {
    return this.db.collections.applications
      .updateOne({ uuid: application.uuid }, { $set: { ...application } })
      .then(() => {
        return new Promise(resolve => resolve(true));
      })
      .catch(err => {
        return new Promise(resolve => resolve(false));
      });
  }
}
