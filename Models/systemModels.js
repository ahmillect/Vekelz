const Sequelize = require("sequelize");

// Create a connection to the database
const db = new Sequelize("vekelz", process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: "mysql",
});

// Test the connection
db.authenticate()
  .then(() => console.log("Connection to the MySQL database has been established successfully."))
  .catch((err) => console.log("Unable to connect to the database:" + err));

// Create User model
const User = db.define(
  "user",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    firstName: { type: Sequelize.STRING, allowNull: false },
    lastName: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false },
    phone: { type: Sequelize.STRING, allowNull: false },
    image: { type: Sequelize.TEXT, allowNull: false },
  },
  { freezeTableName: true, timestamps: false }
);

// Create Car model
const Car = db.define(
  "car",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    carMake: { type: Sequelize.STRING, allowNull: false },
    carModel: { type: Sequelize.STRING, allowNull: false },
    color: { type: Sequelize.STRING, allowNull: false },
    userId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  { freezeTableName: true, timestamps: false }
);

// Create CarImage model
const CarImage = db.define(
  "carimages",
  {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    carId: {
      type: Sequelize.BIGINT,
      allowNull: false,
      references: {
        model: Car,
        key: "id",
      },
    },
    image: { type: Sequelize.TEXT, allowNull: false },
  },
  { freezeTableName: true, timestamps: false }
);

// Create associations
User.hasMany(Car, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  foreignKeyConstraint: true,
});
Car.belongsTo(User, {
  foreignKey: "userId",
  onDelete: "CASCADE",
  foreignKeyConstraint: true,
});
Car.hasMany(CarImage, {
  as: "images",
  foreignKey: "carId",
  onDelete: "CASCADE",
  foreignKeyConstraint: true,
});
CarImage.belongsTo(Car, {
  foreignKey: "carId",
  onDelete: "CASCADE",
  foreignKeyConstraint: true,
});

// Sync the database with the models
db.sync().then(() => {
  console.log("Database & models are now synced!");
});

module.exports = { db, User, Car, CarImage };
