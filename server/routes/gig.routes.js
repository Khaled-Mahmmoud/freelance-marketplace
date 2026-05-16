const express = require("express");
const router = express.Router();
const {
  createGig,
  getAllGigs,
  getGigById,
  updateGig,
  deleteGig,
} = require("../controllers/gig.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/", getAllGigs);
router.get("/:id", getGigById);
router.post("/", protect, createGig);
router.put("/:id", protect, updateGig);
router.delete("/:id", protect, deleteGig);
module.exports = router;
