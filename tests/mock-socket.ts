// From: https://github.com/socketio/socket.io/blob/master/lib/socket.js
// This class is used to test socket.io's socket related functions such as socket.emit().
export default class MockSocket {
  id: string;
  emit: any; // TODO: Change from any to Function for sinon.fake()

  constructor() {
    this.id = "";
    this.emit = () => {};
  }

  setId(id: string) {
    this.id = id;
    return this;
  }

  to(socketId: string) {
    return this;
  }
}
