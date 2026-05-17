const express = require("express");
const ctrl = require("../../controllers/userTokenController");
const { protect } = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("user"));

router.get("/queues/open", ctrl.listOpenQueues);
router.post("/join", ctrl.join);
router.get("/mine", ctrl.myTokens);
router.get("/:id", ctrl.getToken);
router.put("/:id/cancel", ctrl.cancel);

module.exports = router;
