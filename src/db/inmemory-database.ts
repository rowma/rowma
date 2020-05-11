import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Application from "../entity/application";
import CommandLog from "../entity/command-log";

export default class InmemoryDatabase implements DatabaseInterface {
  robotInmemoryDatabase: Array<Robot>;
  applicationInmemoryDatabase: Array<Application>;
  commandLogInmemoryDatabase: Array<CommandLog>;

  // Initialize db (session)
  constructor(
    robotDb: Array<Robot>,
    applicationDb: Array<Application>,
    logDb: Array<CommandLog>
  ) {
    this.robotInmemoryDatabase = robotDb;
    this.applicationInmemoryDatabase = applicationDb;
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

  getAllApplications(): Promise<Array<Application>> {
    return new Promise<Array<Application>>((resolve, reject) => {
      resolve(this.applicationInmemoryDatabase);
    });
  }

  findOneRobotByUuid(uuid: string): Promise<Robot> {
    const robot = _.find(this.robotInmemoryDatabase, r => {
      return _.get(r, "uuid") === uuid;
    });

    return new Promise((resolve, reject) => {
      resolve(robot);
    });
  }

  findRobotsByUuidRegx(uuid: string): Promise<Array<Robot>> {
    const uuidRegex = new RegExp(uuid);
    const robots = this.robotInmemoryDatabase.filter(robot => uuidRegex.test(robot.uuid));

    return new Promise((resolve, reject) => {
      resolve(robots);
    });
  }

  findApplicationByUuid(uuid: string): Promise<Application> {
    const application = _.find(this.applicationInmemoryDatabase, r => {
      return _.get(r, "uuid") === uuid;
    });

    return new Promise((resolve, reject) => {
      resolve(application);
    });
  }

  findApplicationByUuidRegx(uuid: string): Promise<Array<Application>> {
    const uuidRegex = new RegExp(uuid);
    const applications = this.applicationInmemoryDatabase.filter(application => uuidRegex.test(application.uuid));

    return new Promise((resolve, reject) => {
      resolve(applications);
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

  saveApplication(application): Promise<boolean> {
    try {
      this.applicationInmemoryDatabase.push(application);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  getAllApplicationsByUuids(uuids: Array<string>): Promise<Array<Application>> {
    const applications = _.filter(this.applicationInmemoryDatabase, (application: Application) => {
      return _.includes(uuids, application.uuid);
    });
    return new Promise(resolve => resolve(applications));
  }

  updateRobotRosnodes(robot: Robot): Promise<boolean> {
    try {
      const index = _.findIndex(
        this.robotInmemoryDatabase,
        r => r.uuid == robot.uuid
      );
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
        _.remove(this.robotInmemoryDatabase, (robot: Robot) => {
          return robot.uuid === uuid;
        });
        return resolve(true);
      } catch {
        return resolve(false);
      }
    });
  }

  deleteApplication(socketId: string): Promise<boolean> {
    return new Promise(resolve => {
      try {
        _.remove(this.applicationInmemoryDatabase, (application: Application) => {
          return application.socketId === socketId;
        });
        return resolve(true);
      } catch {
        return resolve(false);
      }
    });
  }

  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Application>> {
    const applications = _.filter(this.applicationInmemoryDatabase, (application: Application) => {
      return (application.robotUuid = robotUuid);
    });
    return new Promise(resolve => resolve(applications));
  }

  saveLog(log: CommandLog): Promise<boolean> {
    try {
      this.commandLogInmemoryDatabase.push(log);
      return new Promise(resolve => resolve(true));
    } catch {
      return new Promise(resolve => resolve(false));
    }
  }

  updateApplication(application: Application): Promise<boolean> {
    const index = _.findIndex(this.applicationInmemoryDatabase, (application: Application) => {
      return _.get(application, "uuid") === application.uuid;
    });
    this.applicationInmemoryDatabase[index] = application;
    return new Promise(resolve => resolve(true));
  }
}
