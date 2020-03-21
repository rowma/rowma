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
  networkName: string;
  disconnectedAt: Date | null;

  constructor(
    uuid: string,
    socketId: string,
    launchCommands: Array<string>,
    rosnodes: Array<string>,
    rosrunCommands: Array<string>,
    rostopics: Array<string>,
    networkName: string
  ) {
    this.uuid = uuid;
    this.socketId = socketId;
    this.launchCommands = launchCommands;
    this.rosnodes = rosnodes;
    this.rosrunCommands = rosrunCommands;
    this.rostopics = rostopics;
    this.networkName = networkName;
    this.disconnectedAt = null;
  }
}
