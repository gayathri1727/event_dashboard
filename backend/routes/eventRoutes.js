
const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");

const router = express.Router();

// GET: Fetch all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET: Fetch one event
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST: Create a new event
router.post("/", async (req, res) => {
  try {
    const { eventName, eventDescription, eventDate, venue } = req.body;

    if (
      !eventName?.trim() ||
      !eventDescription?.trim() ||
      !eventDate ||
      !venue?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required event fields",
      });
    }

    const event = await Event.create({
      eventName,
      eventDescription,
      eventDate,
      venue,
    });

    res.status(201).json(event);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid event details" });
    }

    res.status(500).json({ message: "Failed to create event" });
  }
});

// PUT: Update an existing event
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const { eventName, eventDescription, eventDate, venue } = req.body;

    if (
      !eventName?.trim() ||
      !eventDescription?.trim() ||
      !eventDate ||
      !venue?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide all required event fields",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { eventName, eventDescription, eventDate, venue },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: "Invalid event details" });
    }

    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE: Delete an event
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;
