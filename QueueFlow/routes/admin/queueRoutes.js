const express = require("express");
const ctrl = require("../../controllers/adminQueueController");
const { protect } = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.route("/").get(ctrl.list).post(ctrl.create);
router.route("/:id").get(ctrl.get).put(ctrl.update).delete(ctrl.remove);

module.exports = router;
