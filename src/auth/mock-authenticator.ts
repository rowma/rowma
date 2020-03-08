import http from "http";

const server = http.createServer((req, res) => {
  let postData = "";
  req.on("data", chunk => {
    postData += chunk;
  });
  if (req.url === "/robots/auth") {
    console.log(req);
    const msg = { auth: true };
    res.write(JSON.stringify(msg));
    res.end();
  } else if (req.url === "/robots/authz") {
    const msg = { auth: true };
    res.write(JSON.stringify(msg));
    res.end();
  }

  req.on("end", function() {
    res.writeHead(200, { "Content-Type": "application/json" });
    const response = { swarmName: "test" };
    res.end(JSON.stringify(response));
  });
});
server.listen(3001);
