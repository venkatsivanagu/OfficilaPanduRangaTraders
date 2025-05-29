const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNo: {
    type: String,
    required: true
  },
  billDate: {
    type: String,
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  vehicleNo: {
    type: String,
    required: true
  },
  ph: {
    type: String,
    required: true
  },
  totalAmount: {
    type: String,
    required: true
  },
  rows: [{
    srNo: String,
    description: String,
    hsn: String,
    qty: String,
    rate: String,
    amount: String,
    gstPercent: String,
    gstAmount: String,
    totalAmount: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', billSchema); 