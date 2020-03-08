import WSResponse from "../entity/response";

const createSuccessResponse = (data = ""): WSResponse => {
  return new WSResponse("success", data, "");
};

const createErrorResponse = (error = ""): WSResponse => {
  return new WSResponse("failed", "", error);
};

export { createSuccessResponse, createErrorResponse };
