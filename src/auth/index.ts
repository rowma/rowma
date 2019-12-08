import axios from "axios";
import _ from "lodash";

const authenticateRobot = (apiKey: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/robots/auth?apiKey=${apiKey}`)
    .then(response => {
      const swarmName = _.get(response, "data.swarmName");
      return swarmName ? { auth: true, swarmName } : { auth: false };
    })
    .catch(error => {
      return { auth: false , error };
    });
};

const authenticateDevice = (id: string, swarmName: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/devices/auth/?id=${id}&swarm=${swarmName}`)
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth }
    })
    .catch(error => {
      return { auth: false , error };
    });
}

const authorizeDevice = (id: string, swarmName: string, action: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/devices/authz/?id=${id}&swarm=${swarmName}&action=${action}`)
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth }
    })
    .catch(error => {
      return { auth: false , error };
    });
}

export { authenticateRobot, authenticateDevice, authorizeDevice };
