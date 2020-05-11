import Robot from "../entity/robot";
import Application from "../entity/application";
import CommandLog from "../entity/command-log";

export default interface DatabaseInterface {
  getAllRobots(networkUuid: string): Promise<Array<Robot>>;
  getAllApplications(): Promise<Array<Application>>;
  findRobotsByUuidRegx(uuid: string): Promise<Array<Robot>>;
  findOneRobotByUuid(uuid: string): Promise<Robot>;
  findApplicationByUuid(uuid: string): Promise<Application>;
  findApplicationByUuidRegx(uuid: string): Promise<Array<Application>>;
  upsertRobot(robot: Robot): Promise<boolean>;
  removeRobot(socketId: string): Promise<boolean>;
  saveApplication(application: Application): Promise<boolean>;
  getAllApplicationsByUuids(uuids: Array<string>): Promise<Array<Application>>;
  updateRobotRosnodes(robot: Robot): Promise<boolean>;
  removeCurrentRobotConnections(): Promise<boolean>;
  deleteRobot(uuid: string): Promise<boolean>;
  deleteApplication(socketId: string): Promise<boolean>;
  findApplicationsByRobotUuid(robotUuid: string): Promise<Array<Application>>;
  saveLog(log: CommandLog): Promise<boolean>;
  updateApplication(application: Application): Promise<boolean>;
}
