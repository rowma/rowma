import axios from "axios";
import _ from "lodash";

const authenticateRobot = (apiKey: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .post(`${authUrl}/robots/authenticate`, { token: apiKey })
    .then(response => {
      const { auth, network_name: networkName } = response.data
      return { auth, networkName }
    })
    .catch(error => {
      return { auth: false, error };
    });
};

const authenticateDevice = (id: string, networkName: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/devices/auth?id=${id}&network=${networkName}`)
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth };
    })
    .catch(error => {
      return { auth: false, error };
    });
};

const authorizeDevice = (
  jwt: string,
  networkid: string,
  action: string
): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .post(
      `${authUrl}/applications/authorize`,
      { jwt, networkid }
    )
    .then(response => {
      const authz = _.get(response, "data.auth"); // boolean
      return { authz };
    })
    .catch(error => {
      return { authz: false, error };
    });
};

export { authenticateRobot, authenticateDevice, authorizeDevice };
