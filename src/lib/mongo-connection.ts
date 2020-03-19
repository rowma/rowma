import { MongoClient, Collection, ObjectId } from "mongodb";

import Robot from "../entity/robot";
import Device from "../entity/device";

import { MONGODB_URI } from "./settings";

type CollectionsType = {
  robots: Collection<Robot> | null;
  devices: Collection<Device> | null;
};

const collections: CollectionsType = { robots: null, devices: null };
export { collections };

const connect = async () => {
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db();

  collections.robots = db.collection<Robot>("robots");
  collections.devices = db.collection<Device>("devices");
  return { client, db };
};

export { connect };
