const express = require("express");
const {
  getAllCars,
  createCar,
  updateAllCars,
  deleteAllCars,
  getCar,
  getUpdatePage,
  updateCar,
  deleteCar,
  upload,
} = require("../Controllers/carController");
const router = express.Router();

// GET all Cars
router.get("/", getAllCars);

// POST a new Car
router.post("/", upload.array("images"), createCar);

// UPDATE (PUT) all Cars
router.put("/", upload.single("image"), updateAllCars);
router.post("/update", upload.single("image"), updateAllCars);

// DELETE all Cars
router.delete("/", deleteAllCars);
router.get("/delete", deleteAllCars);

// GET a single Car with a given id
router.get("/:id", getCar);

// GET Update Page
router.get("/update/:id", getUpdatePage);

// UPDATE (PUT) a single Car with a given id
router.put("/:id", upload.array("images"), updateCar);
router.post("/update/:id", upload.array("images"), updateCar);

// DELETE a single Car with a given id
router.delete("/:id", deleteCar);
router.get("/delete/:id", deleteCar);

module.exports = router;
