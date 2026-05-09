const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));

app.use("/api/queues", require("./routes/queueRoutes"));

app.use("/api/tokens", require("./routes/tokenRoutes"));

module.exports = app;