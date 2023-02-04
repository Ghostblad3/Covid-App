const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userCaseSchema = new Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    case_date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: false }
);

const UserCase = mongoose.model("UserCase", userCaseSchema);

module.exports = { UserCase, userCaseSchema };
