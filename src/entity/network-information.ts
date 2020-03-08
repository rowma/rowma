interface NetworkInformationInterface {
  name: string;
  type: string;
  location: string;
  owner: string;
  version: string;
}

export default class NetworkInformation {
  name: string;
  type: string;
  location: string;
  owner: string;
  version: string;

  constructor(networkInformation: NetworkInformationInterface) {
    const { name, type, location, owner, version } = networkInformation;
    this.name = name;
    this.type = type;
    this.location = location;
    this.owner = owner;
    this.version = version;
  }
}
