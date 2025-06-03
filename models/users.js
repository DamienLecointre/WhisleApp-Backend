const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    telephone: { type: String, required: true },
    birthdate: { type: Date, required: true },
    photo: { type: String, default: "squirrelLogo.png" },
    token: String,
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: [],
    },

    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "users",
      default: [],
    },

    favorites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "events",
      default: [],
    },
    userRating: [
      {
        raterId: { type: mongoose.Schema.Types.ObjectId, ref: "events" },
        default: [],
        // note: Number,
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("users", userSchema);

module.exports = User;
