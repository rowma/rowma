import {
  registerDevice,
  runLaunch,
  runRosrun,
  delegate
} from "../src/eventcallback/event-from-device";

import inmemoryDb from "../src/db/inmemory-database";
import Robot from "../src/entity/robot";
import Device from "../src/entity/device";

import {
  createSuccessResponse,
  createErrorResponse
} from "../src/lib/response";

import MockSocket from "./mock-socket";

import assert from 'assert';
import sinon from "sinon";

const createMockSocket = (): MockSocket => {
  return new MockSocket();
}

const robot1 = new Robot("abc-robot", "socket-robot", [], [], [], "test")

describe('event-from-device', () => {
  describe('#registerDevice()', () => {
    it('should register 1 device', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { robotUuid: "abc-robot", deviceUuid: "abc-device" }
      const ack = sinon.fake();
      const response = createSuccessResponse();

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

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

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

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { deviceUuid: "abc-device" }
      const ack = sinon.fake();

      const response = createErrorResponse("The robot is not found.")

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

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { robotUuid: "abc-robot-wrong", deviceUuid: "abc-device" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.");

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

      const socket1 = createMockSocket();
      socket1.setId("socket-id-1");
      const payload1 = { robotUuid: "abc-robot", deviceUuid: "abc-device-1" }

      const socket2 = createMockSocket();
      socket2.setId("socket-id-2");
      const payload2 = { robotUuid: "abc-robot", deviceUuid: "abc-device-2" }

      const ack1 = sinon.fake();
      const ack2 = sinon.fake();

      const response = createSuccessResponse();

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

  describe('#runLaunch()', () => {
    it('should emit with a payload', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { uuid: "abc-robot", command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      runLaunch(db, socket, payload, ack)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { uuid: "abc-robot-2", command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      runLaunch(db, socket, payload, ack)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      runLaunch(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#runRosrun()', () => {
    it('should emit with a payload', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { uuid: "abc-robot", command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      runRosrun(db, socket, payload, ack)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { uuid: "abc-robot-2", command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      runRosrun(db, socket, payload, ack)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      runRosrun(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#delegate()', () => {
    it('should emit with a payload', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { robotUuid: "abc-robot", msg: "msg" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      delegate(db, socket, payload, ack)

      // Assert
      // assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { robotUuid: "abc-robot-2", msg: "msg" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      delegate(db, socket, payload, ack)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      delegate(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });
});
