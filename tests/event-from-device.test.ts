import {
  registerDevice,
  runLaunch,
  runRosrun,
  delegate,
  killRosnode
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

const robot1 = new Robot("abc-robot", "socket-robot", [], [], [], [], "test")

describe('event-from-device', () => {
  describe('#registerDevice()', () => {
    it('should register 1 device', async () => {
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
      await registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 1);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not register 1 device when the payload is empty', async () => {
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
      await registerDevice(db, socket, payload, ack)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should register 2 devices and each ack() is called with a success response', async () => {
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
      await registerDevice(db, socket1, payload1, ack1)
      await registerDevice(db, socket2, payload2, ack2)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 2);

      assert.equal(ack1.callCount, 1);
      assert.equal(ack2.callCount, 1);

      assert(ack1.calledWith(response))
      assert(ack2.calledWith(response))
    });
  });

  describe('#runLaunch()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
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
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#runRosrun()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
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
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#delegate()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, msg: "msg" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      await delegate(db, socket, payload, ack, socket)

      // Assert
      // assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, msg: "msg" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      await delegate(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
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
      await delegate(db, socket, payload, ack, socket)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#killRosnode()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, rosnodes: ["/test"] }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      // assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const deviceInmemoryDatabase: Array<Device> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, deviceInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, rosnodes: ["/test"] }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
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
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      assert.equal(deviceInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });
});
