const mongoose = require("mongoose");
const { User } = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

async function createClients(N) {
  const users = await createUsers(N);

  await mongoose.connect("mongodb://mongo-users-db-srv:27017/users");

  var bulk = [];

  users.forEach((user) => {
    bulk.push({ insertOne: { document: user } });
  });

  await User.bulkWrite(bulk);

  console.log("Created new users.");
}

async function createUsers(N) {
  var users = [];

  for (var i = 1; i < N + 1; i++) {
    var hashedPassword = await bcrypt.hash(`user${i}pass`, 10);

    users.push({
      _id: crypto.randomBytes(12).toString("hex"),
      username: `user${i}`,
      password: hashedPassword,
      email: `user${i}@email.com`,
      is_admin: 0,
    });
  }

  var hashedPassword = await bcrypt.hash(`admin1pass`, 10);

  users.push({
    _id: crypto.randomBytes(12).toString("hex"),
    username: "admin",
    password: hashedPassword,
    email: "admin@gmail.com",
    is_admin: 1,
  });

  return users;
}

exports.createClients = createClients;
