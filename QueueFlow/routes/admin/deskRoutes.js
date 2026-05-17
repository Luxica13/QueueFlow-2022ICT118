const express = require("express");
const ctrl = require("../../controllers/adminDeskController");
const { protect } = require("../../middleware/authMiddleware");
const { requireRole } = require("../../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/customers", ctrl.listCustomers);
router.get("/board/:queueId", ctrl.getBoard);
router.post("/call-next", ctrl.callNext);
router.post("/promote-waiting", ctrl.promoteWaiting);
router.post("/join", ctrl.joinForUser);
router.put("/complete/:id", ctrl.complete);
router.put("/remove/:id", ctrl.remove);

module.exports = router;
