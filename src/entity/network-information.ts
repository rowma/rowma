interface NetworkInformationInterface {
  name: string;
  type: string;
  location: string;
  owner: string;
}

export default class NetworkInformation {
  name: string;
  type: string;
  location: string;
  owner: string;

  constructor(networkInformation: NetworkInformationInterface) {
    const { name, type, location, owner } = networkInformation;
    this.name = name;
    this.type = type;
    this.location = location;
    this.owner = owner;
  }
}
