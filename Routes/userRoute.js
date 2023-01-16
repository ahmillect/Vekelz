const express = require("express");
const {
  getAllUsers,
  createUser,
  updateAllUsers,
  deleteAllUsers,
  getUser,
  getUpdatePage,
  updateUser,
  deleteUser,
  upload,
} = require("../Controllers/userController");
const router = express.Router();

// GET all Users
router.get("/", getAllUsers);

// POST a new User
router.post("/", upload.single("image"), createUser);

// UPDATE (PUT) all Users
router.put("/", upload.single("image"), updateAllUsers);
router.post("/update", upload.single("image"), updateAllUsers);

// DELETE all Users
router.delete("/", deleteAllUsers);
router.get("/delete", deleteAllUsers);

// GET a single User with a given id
router.get("/:id", getUser);

// GET Update Page
router.get("/update/:id", getUpdatePage);

// UPDATE (PUT) a single User with a given id
router.put("/:id", upload.single("image"), updateUser);
router.post("/update/:id", upload.single("image"), updateUser);

// DELETE a single User with a given id
router.delete("/:id", deleteUser);
router.get("/delete/:id", deleteUser);

module.exports = router;
