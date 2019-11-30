import {
  registerDevice
} from "../src/eventcallback/event-from-device";

import inmemoryDb from "../src/db/inmemory-database";
import Robot from "../src/entity/robot";
import Device from "../src/entity/device";
import WSResponse from "../src/response";

import assert from 'assert';
import sinon from "sinon";

const robot1 = new Robot("abc-robot", "socket-robot", [], [], [], "test")

describe('event-from-device', () => {
  describe('#registerDevice()', () => {
    it('should register 1 device', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { robotUuid: "abc-robot", deviceUuid: "abc-device" }
      const ack = sinon.fake();
      const response = new WSResponse("success", "", "");

      // Act
      registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 1);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not register 1 device when the payload is empty', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = {};
      const ack = sinon.fake();
      const response = new WSResponse("failed", "", "Payload must be included.");

      // Act
      registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not register 1 device when the uuid is missing', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { deviceUuid: "abc-device" }
      const ack = sinon.fake();

      const response = new WSResponse("failed", "", "The robot is not found.");

      // Act
      registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not register 1 device when the robotUuid is wrong', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = { id: "socket-id" }
      const payload = { robotUuid: "abc-robot-wrong", deviceUuid: "abc-device" }
      const ack = sinon.fake();
      const response = new WSResponse("failed", "", "The robot is not found.");

      // Act
      registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should register 2 devices and each ack() is called with a success response', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket1 = { id: "socket-id-1" }
      const payload1 = { robotUuid: "abc-robot", deviceUuid: "abc-device-1" }

      const socket2 = { id: "socket-id-2" }
      const payload2 = { robotUuid: "abc-robot", deviceUuid: "abc-device-2" }

      const ack1 = sinon.fake();
      const ack2 = sinon.fake();

      const response = new WSResponse("success", "", "");

      // Act
      registerDevice(db, socket1, payload1, ack1)
      registerDevice(db, socket2, payload2, ack2)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 2);

      assert.equal(ack1.callCount, 1);
      assert.equal(ack2.callCount, 1);

      assert(ack1.calledWith(response))
      assert(ack2.calledWith(response))
    });
  });
});
