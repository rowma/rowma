export default class WSResponse {
  status: string;
  data: string;
  error: string;

  constructor(status: string, data: string, error: string) {
    this.status = status;
    this.data = data;
    this.error = error;
  }
}
