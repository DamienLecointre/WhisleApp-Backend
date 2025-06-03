const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },
  coordinates: {
    type: [Number],
    required: true,
    address: { type: String },
  },
});

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: locationSchema,
    date: { type: Date, required: true },
    type: { type: String, required: true },
    participants: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "handEvent.png" },
    eventRating: [
      {
        raterId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        note: Number,
      },
    ],
    creators: { type: mongoose.Schema.Types.ObjectId, ref: "users" },

    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Event = mongoose.model("events", eventSchema);

module.exports = Event;
