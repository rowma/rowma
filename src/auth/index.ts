import axios from "axios";
import _ from "lodash";

import { AUTHENTICATOR_URL } from "../lib/settings";

const authenticateRobot = (apiKey: string): Promise<any> => {
  return axios
    .post(`${AUTHENTICATOR_URL}/robots/authenticate`, { token: apiKey })
    .then(response => {
      const { auth, network_uuid: networkUuid, msg } = response.data;
      return { auth, networkUuid, msg };
    })
    .catch(error => {
      return { auth: false, error };
    });
};

const authenticateApplication = (
  id: string,
  networkName: string
): Promise<any> => {
  return axios
    .get(
      `${AUTHENTICATOR_URL}/applications/auth?id=${id}&network=${networkName}`
    )
    .then(response => {
      const auth = _.get(response, "data.auth"); // boolean
      return { auth };
    })
    .catch(error => {
      return { auth: false, error };
    });
};

const authorizeApplication = (
  jwt = "",
  apiKey = "",
  networkUuid: string,
  action: string
): Promise<any> => {
  return axios
    .post(`${AUTHENTICATOR_URL}/applications/authorize`, {
      jwt,
      apiKey,
      networkUuid,
      action
    })
    .then(response => {
      const authz = _.get(response, "data.auth"); // boolean
      return { authz };
    })
    .catch(error => {
      return { authz: false, error };
    });
};

export { authenticateRobot, authenticateApplication, authorizeApplication };
