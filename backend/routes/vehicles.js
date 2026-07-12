const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = {};
    if (type && type !== 'All') filter.type = type;
    if (status && status !== 'All') filter.status = status;

    const vehicles = await Vehicle.find(filter).sort({ registrationNo: 1 });
    res.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Server error fetching vehicles' });
  }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private (FleetManager only)
router.post('/', protect, authorize('FleetManager'), async (req, res) => {
  try {
    const { registrationNo, name, type, capacityKg, odometerKm, acquisitionCost, status } = req.body;

    // Check if duplicate registration
    const existing = await Vehicle.findOne({ registrationNo: registrationNo.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Registration number must be unique' });
    }

    const vehicle = await Vehicle.create({
      registrationNo,
      name,
      type,
      capacityKg,
      odometerKm,
      acquisitionCost,
      status: status || 'Available'
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error creating vehicle' });
  }
});

module.exports = router;
