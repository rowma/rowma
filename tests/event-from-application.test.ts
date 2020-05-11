import {
  registerApplication,
  runLaunch,
  runRosrun,
  topicTransfer,
  killRosnode
} from "../src/eventcallback/event-from-application";

import inmemoryDb from "../src/db/inmemory-database";
import Robot from "../src/entity/robot";
import Application from "../src/entity/application";
import CommandLog from "../src/entity/command-log"

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

describe('event-from-application', () => {
  describe('#registerApplication()', () => {
    it('should register 1 application', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = { robotUuid: "abc-robot", applicationUuid: "abc-application" }
      const ack = sinon.fake();
      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await registerApplication(db, socket, payload, ack)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 1);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not register 1 application when the payload is empty', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await registerApplication(db, socket, payload, ack)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should register 2 applications and each ack() is called with a success response', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket1 = createMockSocket();
      socket1.setId("socket-id-1");
      const payload1 = { robotUuid: "abc-robot", applicationUuid: "abc-application-1" }

      const socket2 = createMockSocket();
      socket2.setId("socket-id-2");
      const payload2 = { robotUuid: "abc-robot", applicationUuid: "abc-application-2" }

      const ack1 = sinon.fake();
      const ack2 = sinon.fake();

      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await registerApplication(db, socket1, payload1, ack1)
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await registerApplication(db, socket2, payload2, ack2)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 2);

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
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runLaunch(db, socket, payload, ack, socket)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#runRosrun()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, command: "pkg command" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await runRosrun(db, socket, payload, ack, socket)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#topicTransfer()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, msg: "msg" }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await topicTransfer(db, socket, payload, ack, socket)

      // Assert
      // assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, msg: "msg" }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await topicTransfer(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await topicTransfer(db, socket, payload, ack, socket)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });

  describe('#killRosnode()', () => {
    it('should emit with a payload', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot' }
      const payload = { destination, rosnodes: ["/test"] }
      const ack = sinon.fake();
      socket.emit = sinon.fake();

      const response = createSuccessResponse();

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      // assert.equal(socket.emit.callCount, 1);
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the uuid is wrong', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const destination = { type: 'robot', uuid: 'abc-robot-2' }
      const payload = { destination, rosnodes: ["/test"] }
      const ack = sinon.fake();
      const response = createErrorResponse("The robot is not found.")

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      assert.equal(socket.emit.callCount, undefined)
      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });

    it('should not emit when the payload is empty', async () => {
      // Arrange
      const robotInmemoryDatabase: Array<Robot> = [robot1];
      const applicationInmemoryDatabase: Array<Application> = [];
      const commandLogInmemoryDatabase: Array<CommandLog> = [];
      const db = new inmemoryDb(robotInmemoryDatabase, applicationInmemoryDatabase, commandLogInmemoryDatabase);

      const socket = createMockSocket();
      socket.setId("socket-id");
      const payload = {};
      const ack = sinon.fake();
      const response = createErrorResponse("Payload must be included.");

      // Act
      // ts-ignore because original MockSocket is used.
      // @ts-ignore
      await killRosnode(db, socket, payload, ack, socket)

      // Assert
      assert.equal(applicationInmemoryDatabase.length, 0);

      assert.equal(ack.callCount, 1);
      assert(ack.calledWith(response))
    });
  });
});
