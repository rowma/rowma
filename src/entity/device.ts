export default class Device {
  uuid: string;
  socketId: string;
  networkUuid: string;

  constructor(uuid: string, socketId: string, networkUuid: string) {
    this.uuid = uuid;
    this.socketId = socketId;
    this.networkUuid = networkUuid;
  }
}
