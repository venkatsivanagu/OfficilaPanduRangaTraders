const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new bill
router.post('/', async (req, res) => {
  const bill = new Bill(req.body);
  try {
    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a specific bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (bill) {
      res.json(bill);
    } else {
      res.status(404).json({ message: 'Bill not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (bill) {
      await bill.deleteOne();
      res.json({ message: 'Bill deleted' });
    } else {
      res.status(404).json({ message: 'Bill not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 