const NETWORK_NAME = process.env.ROWMA_NETWORK_NAME || "Public Network";
const NETWORK_TYPE = process.env.ROWMA_NETWORK_TYPE || "Public";
const NETWORK_LOCATION = process.env.ROWMA_NETWORK_LOCATION || "";
const NETWORK_OWNER = process.env.ROWMA_NETWORK_OWNER || "";

const ROWMA_VERSION = process.env.npm_package_version || "";

const DATABASE: string = process.env.ROWMA_DB || "inmemory";
const PORT: number = Number(process.env.PORT) || 3000;

export {
  NETWORK_NAME,
  NETWORK_TYPE,
  NETWORK_LOCATION,
  NETWORK_OWNER,
  ROWMA_VERSION,
  DATABASE,
  PORT
};
