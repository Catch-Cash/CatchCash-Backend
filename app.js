const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");

const config = require("./config/config");
const sequelize = require("./models/index").sequelize;
const api = require("./api");

const app = express();
sequelize.sync();

const port = 1212;

// process.once("SIGUSR2", function() {
//   server.close(function() {
//     process.kill(process.pid, "SIGUSR2");
//   });
// });

app.use(express.json());
app.use(morgan("dev"));
app.use("/", api);
app.set("jwt-secret", config.secret);

app.listen(port, () => {
  console.log(`Express server is running at ${port}`);
});
