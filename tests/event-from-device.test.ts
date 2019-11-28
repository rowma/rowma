import {
  registerDevice
} from "../src/eventcallback/event-from-device";

import inmemoryDb from "../src/db/inmemory-database";
import Robot from "../src/entity/robot";
import Device from "../src/entity/device";

import assert from 'assert';

const robot1 = new Robot("abc-robot", "socket-robot", [], [], [], "test")

describe('event-from-device', () => {
  describe('#registerDevice()', () => {
    it('should register 1 device', () => {
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { robotUuid: "abc-robot", deviceUuid: "abc-device" }
      registerDevice(db, socket, payload, () => {})
      console.log(db)
      assert.equal(deviceInmemoryDatabase.length, 1);
    });
  });
});
