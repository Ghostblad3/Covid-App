const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      require: true,
    },
    is_admin: {
      type: Number,
      require: true,
    },
  },
  { timestamps: false }
);

const User = mongoose.model("User", userSchema);

module.exports = { User, userSchema };
