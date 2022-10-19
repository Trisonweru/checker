const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    online: {
      type: Boolean,
      required: true,
    },
    bets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bet",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
