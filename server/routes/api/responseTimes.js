const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

// Path to JSON file for storing response times
const dataFilePath = path.join(__dirname, "../../data/responseTimes.json");

// Ensure the data file exists
const ensureDataFile = () => {
  if (!fs.existsSync(path.dirname(dataFilePath))) {
    fs.mkdirSync(path.dirname(dataFilePath), { recursive: true });
  }

  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(
      dataFilePath,
      JSON.stringify({
        averageTime: 8000,
        samples: 0,
        lastUpdated: new Date().toISOString(),
      })
    );
  }
};

// Get the current response time data
router.get("/", (req, res) => {
  try {
    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
    res.json(data);
  } catch (error) {
    console.error("Error reading response time data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update the response time data
router.post(
  "/",
  [
    check("averageTime", "Average time is required").isNumeric(),
    check("samples", "Number of samples is required").isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      ensureDataFile();

      const { averageTime, samples } = req.body;

      // Save the updated data
      const updatedData = {
        averageTime,
        samples,
        lastUpdated: new Date().toISOString(),
      };

      fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));

      res.json(updatedData);
    } catch (error) {
      console.error("Error updating response time data:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
