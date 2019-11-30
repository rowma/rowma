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
      assert.equal(deviceInmemoryDatabase.length, 1);
    });

    it('should not register 1 device when the payload is empty', () => {
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = {}
      registerDevice(db, socket, payload, () => {})
      assert.equal(deviceInmemoryDatabase.length, 0);
    });

    it('should not register 1 device when the uuid is missing', () => {
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { deviceUuid: "abc-device" }
      registerDevice(db, socket, payload, () => {})
      console.log(db)
      assert.equal(deviceInmemoryDatabase.length, 0);
    });

    it('should not register 1 device when the robotUuid is wrong', () => {
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { robotUuid: "abc-robot-wrong", deviceUuid: "abc-device" }
      registerDevice(db, socket, payload, () => {})
      console.log(db)
      assert.equal(deviceInmemoryDatabase.length, 0);
    });

    it('should register 2 devices', () => {
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket1 = { id: "socket-id-1" }
      const payload1 = { robotUuid: "abc-robot", deviceUuid: "abc-device-1" }

      const socket2 = { id: "socket-id-2" }
      const payload2 = { robotUuid: "abc-robot", deviceUuid: "abc-device-2" }

      registerDevice(db, socket1, payload1, () => {})
      registerDevice(db, socket2, payload2, () => {})

      assert.equal(deviceInmemoryDatabase.length, 2);
    });
  });
});
