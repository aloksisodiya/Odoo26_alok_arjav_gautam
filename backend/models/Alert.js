const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  type: {
    type: String,
    enum: ['Maintenance', 'Geofence', 'Depreciation', 'LicenseExpiry'],
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
    default: 'Medium'
  },
  message: {
    type: String,
    required: true
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', AlertSchema);
