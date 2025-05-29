const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  vehicleNo: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  phonepeAmount: {
    type: Number,
    required: true
  },
  cashAmount: {
    type: Number,
    required: true
  },
  expenditure: {
    type: Number,
    required: true
  },
  profit: {
    type: Number,
    default: 0
  },
  loss: {
    type: Number,
    default: 0
  },
  recipientName: {
    type: String,
    required: true
  },
  billDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Entry', entrySchema);
