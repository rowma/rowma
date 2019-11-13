export default class Device {
  uuid: string;
  socketId: string;
  robotUuid: string;

  constructor(uuid: string, socketId: string, robotUuid: string) {
    this.uuid = uuid;
    this.socketId = socketId;
    this.robotUuid = robotUuid;
  }
}
