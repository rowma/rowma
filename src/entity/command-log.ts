import { ObjectId } from "mongodb";

export default class CommandLog {
  _id?: ObjectId;
  type: string;
  cmd: string;
  robotUuid: string;
  log: string;
  createdAt: Date;

  constructor(type: string, cmd: string, robotUuid: string, log: string) {
    this.type = type;
    this.cmd = cmd;
    this.robotUuid = robotUuid;
    this.log = log;
    this.createdAt = new Date();
  }
}
