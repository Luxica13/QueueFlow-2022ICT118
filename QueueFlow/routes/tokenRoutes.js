const express = require("express");

const router = express.Router();

const {
  joinQueue,
  getQueueStatus,
  callNext,
  completeToken,
  skipToken,
  cancelToken,
} = require("../controllers/tokenController");

router.post("/join", joinQueue);

router.get("/status/:id", getQueueStatus);

router.post("/call-next", callNext);

router.put("/complete/:id", completeToken);

router.put("/skip/:id", skipToken);

router.put("/cancel/:id", cancelToken);

module.exports = router;