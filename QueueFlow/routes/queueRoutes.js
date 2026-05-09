const express = require("express");

const router = express.Router();

const {
  createQueue,
  getQueues,
} = require("../controllers/queueController");

router.post("/", createQueue);

router.get("/", getQueues);

module.exports = router;