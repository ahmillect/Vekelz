const express = require("express");
const { welcome } = require("../Controllers/guestController");
const router = express.Router();

// Landing page
router.get("/", welcome);

module.exports = router;
