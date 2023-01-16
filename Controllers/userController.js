const multer = require("multer");
const path = require("path");
const randomstring = require("randomstring");
const { db, User } = require("../Models/systemModels.js");

// GET all Users
exports.getAllUsers = async (req, res) => {
  await User.findAll()
    .then((users) => {
      //res.status(200).send(users);
      res.render("users", { title: "Users", users: users });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Users.",
      });
    });
};

// Image Upload File Filter
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};

// Image Upload Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "Media");
  },
  filename: function (req, file, cb) {
    const randomPath = randomstring.generate({
      length: 41,
      charset: "alphabetic",
      capitalization: "lowercase",
    });
    cb(null, `${randomPath}${path.extname(file.originalname)}`);
  },
});

// Image Upload
exports.upload = multer({ storage: storage, fileFilter: imageFilter });

// POST a new User
exports.createUser = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Save User in the database
  await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    image: db.Sequelize.fn(
      "concat",
      `http://localhost:${process.env.port}/Media/`,
      req.file.filename
    ),
  })
    .then((user) => {
      req.session.message = {
        type: "success",
        message: "User was created successfully",
      };
      //res.status(200).send(user);
      res.redirect("/api/user");
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Some error occurred while creating the User.",
      })
    );
};

// UPDATE (PUT) all Users
exports.updateAllUsers = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Update all Users in the database
  await User.update(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      image: db.Sequelize.fn(
        "concat",
        `http://localhost:${process.env.port}/Media/`,
        req.file.filename
      ),
    },
    { where: {} }
  )
    .then((users) => {
      req.session.message = {
        type: "info",
        message: "All Users were updated successfully",
      };
      res.redirect("/api/user");
      //res.status(200).send({ message: "All Users were updated successfully" });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating User with id " + req.params.id,
        });
      }
    });
};

// DELETE all Users
exports.deleteAllUsers = async (req, res) => {
  await User.destroy({
    truncate: { cascade: true },
  })
    .then((users) => {
      req.session.message = {
        type: "danger",
        message: "All Users were deleted successfully",
      };
      res.redirect("/api/user");
      //res.status(200).send({ message: "All Users were deleted successfully" });
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Users.",
      })
    );
};

// GET a single User with a given id
exports.getUser = async (req, res) => {
  await User.findByPk(req.params.id)
    .then((user) => {
      res.render("userProfile", { title: "User Profile", user: user });
      //res.status(200).send(user);
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        console.log(err);
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.id,
        });
      }
    });
};

// UPDATE (PUT) a single User with a given id
exports.updateUser = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  await User.update(
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      image: db.Sequelize.fn(
        "concat",
        `http://localhost:${process.env.port}/Media/`,
        req.file.filename
      ),
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((user) => {
      req.session.message = {
        type: "info",
        message: `User with ID ${req.params.id} was updated successfully`,
      };
      res.redirect("/api/user");
      //res.status(200).send({ message: "User with ID ${req.params.id} was updated successfully" });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error updating User with id " + req.params.id,
        });
      }
    });
};

// GET Update Page
exports.getUpdatePage = async (req, res) => {
  await User.findByPk(req.params.id, { raw: true })
    .then((user) => {
      res.render("userUpdate", { title: "Update User", user: user });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving User with id " + req.params.id,
        });
      }
    });
};

// DELETE a single User with a given id
exports.deleteUser = async (req, res) => {
  await User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((user) => {
      req.session.message = {
        type: "danger",
        message: `User with ID ${req.params.id} was deleted successfully`,
      };
      res.redirect("/api/user");
      //res.status(200).send({ message: "User with ID ${req.params.id} was deleted successfully" });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found User with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete User with id " + req.params.id,
        });
      }
    });
};
