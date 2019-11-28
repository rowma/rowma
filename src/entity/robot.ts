import Device from "./device";

export default class Robot {
  uuid: string;
  socketId: string;
  launchCommands: Array<string>;
  rosnodes: Array<string>;
  rosrunCommands: Array<string>;
  projectName: string;

  constructor(
    uuid: string,
    socketId: string,
    launchCommands: Array<string>,
    rosnodes: Array<string>,
    rosrunCommands: Array<string>,
    projectName: string
  ) {
    this.uuid = uuid;
    this.socketId = socketId;
    this.launchCommands = launchCommands;
    this.rosnodes = rosnodes;
    this.rosrunCommands = rosrunCommands;
    this.projectName = projectName;
  }
}
