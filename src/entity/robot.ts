import { ObjectId } from "mongodb";
import Device from "./device";

export default class Robot {
  _id?: ObjectId;
  uuid: string;
  socketId: string;
  launchCommands: Array<string>;
  rosnodes: Array<string>;
  rosrunCommands: Array<string>;
  rostopics: Array<string>;
  networkUuid: string;
  disconnectedAt: Date | null;
  createdAt: Date;

  constructor(
    uuid: string,
    socketId: string,
    launchCommands: Array<string>,
    rosnodes: Array<string>,
    rosrunCommands: Array<string>,
    rostopics: Array<string>,
    networkUuid: string
  ) {
    this.uuid = uuid;
    this.socketId = socketId;
    this.launchCommands = launchCommands;
    this.rosnodes = rosnodes;
    this.rosrunCommands = rosrunCommands;
    this.rostopics = rostopics;
    this.networkUuid = networkUuid;
    this.disconnectedAt = null;
    this.createdAt = new Date();
  }
}
