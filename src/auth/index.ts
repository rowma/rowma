import axios from "axios";
import _ from "lodash";

const authenticate = (apiKey: string): Promise<any> => {
  const authUrl = _.get(process.env, "AUTHENTICATOR_URL");
  return axios
    .get(`${authUrl}?apiKey=${apiKey}`)
    .then(response => {
      const projectName = _.get(response, "data.projectName");
      return projectName ? { success: true, projectName } : { success: false };
    })
    .catch(error => {
      return { success: false };
    });
};

export { authenticate };
