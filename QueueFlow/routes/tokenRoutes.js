const express = require("express");

const router = express.Router();

const {
  joinQueue,
  getQueueStatus,
  callNext,
  completeToken,
  cancelToken,
  offerWaitingSpot,
  acceptWaitingSpot,
  rejectWaitingSpot,
} = require("../controllers/tokenController");

// Join queue
router.post("/join", joinQueue);

// Get token/queue status
router.get("/status/:id", getQueueStatus);

// Call next reserved user
router.post("/call-next", callNext);

// Complete token
router.put("/complete/:id", completeToken);

// Cancel token
router.put("/cancel/:id", cancelToken);

// Offer available reserved spot to waiting user
router.post("/offer-waiting-spot", offerWaitingSpot);

// Waiting user accepts offered spot
router.put("/accept/:id", acceptWaitingSpot);

// Waiting user rejects offered spot
router.put("/reject/:id", rejectWaitingSpot);

module.exports = router;