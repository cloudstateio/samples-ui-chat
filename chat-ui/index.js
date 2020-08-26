const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.use("/", express.static("public"));

server.listen(3000);
console.log("Http Servee running on " + server.address().address + ":" + server.address().port);
