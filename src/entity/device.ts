export default class Device {
  uuid: string;
  socketId: string;

  constructor(uuid: string, socketId: string) {
    this.uuid = uuid;
    this.socketId = socketId;
  }
}
