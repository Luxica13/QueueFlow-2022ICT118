const express = require("express");
const cors = require("cors");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "QueueFlow API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/queues", require("./routes/admin/queueRoutes"));
app.use("/api/admin/desk", require("./routes/admin/deskRoutes"));
app.use("/api/user", require("./routes/user/tokenRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
