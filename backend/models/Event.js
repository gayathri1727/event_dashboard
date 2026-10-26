
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    eventDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    eventDate: {
      type: Date,
      required: true,
    },

    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Reserved for registration functionality.
    registrations: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.totalRegistrations = ret.registrations
          ? ret.registrations.length
          : 0;
        return ret;
      },
    },
  }
);

eventSchema.virtual("totalRegistrations").get(function () {
  return this.registrations.length;
});

module.exports = mongoose.model("Event", eventSchema);
