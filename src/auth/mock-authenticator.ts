import http from "http";

const server = http.createServer((req, res) => {
  let postData = "";
  req.on("data", chunk => {
    postData += chunk;
  });

  req.on("end", function() {
    res.writeHead(200, { "Content-Type": "application/json" });
    const response = { projectName: "test" };
    res.end(JSON.stringify(response));
  });
});
server.listen(3001);
