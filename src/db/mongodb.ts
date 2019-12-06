import _ from "lodash";

import DatabaseInterface from "./database-interface";

import Robot from "../entity/robot";
import Device from "../entity/device";

export default class Mongodb implements DatabaseInterface {
  db: any;

  // Initialize db (session)
  constructor(db: any) {
    this.db = db
  }

  getAllRobots(): Promise<Array<Robot>> {
    return this.db.collections.robots.find().toArray()
  }

  getAllDevices(): Array<Device> {
    return this.db.collections.devices.find().toArray().then(res => {
      return res
    })
  }

  findRobotByUuid(uuid: string): Robot {
    return this.db.collections.robots.findOne({uuid: uuid}).then(res => {
      return res
    })
  }

  saveRobot(robot: Robot): boolean {
    return this.db.collections.robots.insertOne(robot).then(res => {
      return res
    })
  }

  removeRobot(socketId: string): boolean {
    return true
  }

  saveDevice(device): boolean {
    return this.db.collections.devices.insertOne(device).then(res => {
      return true
    })
  }

  getAllDevicesByRobotUuid(uuid: string): Array<Device> {
    return this.db.collections.devicesrobots.find({robotUuid: uuid}).then(res => {
      return res
    })
  }

  // TODO: Confirm if this method really work correctly
  updateRobotRosnodes(uuid: string, rosnodes: Array<string>): boolean {
    return true
  }
}
