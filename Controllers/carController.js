const multer = require("multer");
const path = require("path");
const randomstring = require("randomstring");
const { db, User, Car, CarImage } = require("../Models/systemModels.js");

// GET all Cars
exports.getAllCars = async (req, res) => {
  await User.findAll().then((users) => {
    Car.findAll({
      attributes: ["id", "carMake", "carModel", "color"],
      include: [
        {
          model: CarImage,
          as: "images",
          attributes: ["id", "image"],
        },
        {
          model: User,
        },
      ],
    })
      .then((cars) => {
        res.status(200).send(cars);
        //res.render("cars", { title: "Cars", cars: cars, users: users });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Cars.",
        });
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

// POST a new Car
exports.createCar = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Save Car in the database
  await Car.create({
    carMake: req.body.carMake,
    carModel: req.body.carModel,
    color: req.body.color,
    userId: req.body.userId,
  })
    .then((car) => {
      req.files.forEach(async (file) => {
        await CarImage.create({
          carId: car.id,
          image: db.Sequelize.fn(
            "concat",
            `http://localhost:${process.env.port}/Media/`,
            file.filename
          ),
        });
      });
      req.session.message = {
        type: "success",
        message: "Car was created successfully",
      };
      //res.redirect("/api/cars");
      res.status(200).send(car);
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Car.",
      })
    );
};

// UPDATE (PUT) all Cars
exports.updateAllCars = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Save Car in the database
  await Car.update(
    {
      carMake: req.body.carMake,
      carModel: req.body.carModel,
      color: req.body.color,
      userId: req.body.userId,
    },
    { where: {} }
  )
    .then((cars) => {
      CarImage.update(
        {
          image: db.Sequelize.fn(
            "concat",
            `http://localhost:${process.env.port}/Media/`,
            req.file.filename
          ),
        },
        { where: {} }
      );
      req.session.message = {
        type: "info",
        message: `All Cars were updated successfully`,
      };
      //res.redirect("/api/cars");
      res.status(200).send({ message: "All Cars were updated successfully" });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Car with id ${req.params.id}.`,
        });
      } else {
        console.log(err);
        res.status(500).send({
          message: "Error updating Car with id " + req.params.id,
        });
      }
    });
};

// DELETE all Cars
exports.deleteAllCars = async (req, res) => {
  await Car.destroy({
    truncate: { cascade: true },
  })
    .then((cars) => {
      req.session.message = {
        type: "danger",
        message: "All Cars were deleted successfully",
      };
      //res.redirect("/api/cars");
      res.status(200).send({ message: "All Cars were deleted successfully" });
    })
    .catch((err) =>
      res.status(500).send({
        message: err.message || "Some error occurred while removing all Car.",
      })
    );
};

// GET a single Car with a given id
exports.getCar = async (req, res) => {
  await Car.findByPk(req.params.id, {
    attributes: ["id", "carMake", "carModel", "color"],
    include: [
      {
        model: CarImage,
        as: "images",
        attributes: ["id", "image"],
      },
      {
        model: User,
      },
    ],
  })
    .then((car) => {
      CarImage.findAll({
        where: {
          carId: car.id,
        },
        raw: true,
      }).then((images) => {
        //res.render("carProfile", { title: "Car Profile", car: car, images: images });
        res.status(200).send(car);
      });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Car with id ${req.params.id}.`,
        });
      } else {
        console.log(err);
        res.status(500).send({
          message: "Error retrieving Car with id " + req.params.id,
        });
      }
    });
};

// UPDATE (PUT) a single Car with a given id
exports.updateCar = async (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
  }
  // Save Car in the database
  await Car.update(
    {
      carMake: req.body.carMake,
      carModel: req.body.carModel,
      color: req.body.color,
      userId: req.body.userId,
    },
    {
      where: {
        id: req.params.id,
      },
    }
  )
    .then((car) => {
      CarImage.findAll({
        where: {
          carId: req.params.id,
        },
      }).then((carimages) => {
        let index = 0;
        carimages.forEach(async (carimage) => {
          if (req.files[index]) {
            carimage.update({
              image: db.Sequelize.fn(
                "concat",
                `http://localhost:${process.env.port}/Media/`,
                req.files[index].filename
              ),
            });
            index++;
          }
        });
      });
      req.session.message = {
        type: "info",
        message: `Car with ID ${req.params.id} was updated successfully`,
      };
      //res.redirect("/api/cars");
      res
        .status(200)
        .send({
          message: `Car with ID ${req.params.id} was updated successfully`,
        });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Car with id ${req.params.id}.`,
        });
      } else {
        console.log(err);
        res.status(500).send({
          message: "Error updating Car with id " + req.params.id,
        });
      }
    });
};

// GET Update Page
exports.getUpdatePage = async (req, res) => {
  let users = await User.findAll();
  await Car.findByPk(req.params.id, { raw: true })
    .then((car) => {
      CarImage.findAll({
        where: {
          carId: car.id,
        },
        raw: true,
      }).then((images) => {
        res.render("carUpdate", {
          title: "Update Car",
          car: car,
          images: images,
          users: users,
        });
      });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Car with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Car with id " + req.params.id,
        });
      }
    });
};

// DELETE a single Car with a given id
exports.deleteCar = async (req, res) => {
  await Car.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((car) => {
      req.session.message = {
        type: "danger",
        message: `Car with ID ${req.params.id} was deleted successfully`,
      };
      //res.redirect("/api/cars");
      res
        .status(200)
        .send({
          message: `Car with ID ${req.params.id} was deleted successfully!`,
        });
    })
    .catch((err) => {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Car with id ${req.params.id}.`,
        });
      } else {
        res.status(500).send({
          message: "Could not delete Car with id " + req.params.id,
        });
      }
    });
};
