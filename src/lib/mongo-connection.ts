import { MongoClient, Collection, ObjectId } from "mongodb";

import Robot from "../entity/robot";
import Application from "../entity/application";

import { MONGODB_URI } from "./settings";

type CollectionsType = {
  robots: Collection<Robot> | null;
  applications: Collection<Application> | null;
};

const collections: CollectionsType = { robots: null, applications: null };
export { collections };

const connect = async () => {
  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  const db = client.db();

  collections.robots = db.collection<Robot>("robots");
  collections.applications = db.collection<Application>("applications");
  return { client, db };
};

export { connect };
