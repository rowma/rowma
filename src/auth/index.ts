import axios from "axios";
import _ from "lodash";

const authenticateRobot = (apiKey: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/robots/auth?apiKey=${apiKey}`)
    .then(response => {
      const projectName = _.get(response, "data.projectName");
      return projectName ? { auth: true, projectName } : { auth: false };
    })
    .catch(error => {
      return { auth: false , error };
    });
};

const authenticateDevice = (id: string, projectName: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/devices/auth/?id=${id}&project=${projectName}`)
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth }
    })
    .catch(error => {
      return { auth: false , error };
    });
}

const authorizeDevice = (id: string, projectName: string, action: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}/devices/authz/?id=${id}&project=${projectName}&action=${action}`)
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth }
    })
    .catch(error => {
      return { auth: false , error };
    });
}

export { authenticateRobot, authenticateDevice, authorizeDevice };
