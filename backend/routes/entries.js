const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// Get all entries
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.billDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const entries = await Entry.find(query).sort({ billDate: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new entry
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    // Validate required fields
    const requiredFields = ['vehicleNo', 'totalAmount', 'phonepeAmount', 'cashAmount', 'expenditure', 'recipientName', 'billDate'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }
    
    // Create new entry with validated data
    const entry = new Entry({
      vehicleNo: req.body.vehicleNo,
      totalAmount: parseFloat(req.body.totalAmount) || 0,
      phonepeAmount: parseFloat(req.body.phonepeAmount) || 0,
      cashAmount: parseFloat(req.body.cashAmount) || 0,
      expenditure: parseFloat(req.body.expenditure) || 0,
      profit: parseFloat(req.body.profit) || 0,
      loss: parseFloat(req.body.loss) || 0,
      recipientName: req.body.recipientName,
      billDate: new Date(req.body.billDate)
    });
    
    console.log('Attempting to save entry:', entry);
    const newEntry = await entry.save();
    console.log('Entry saved successfully:', newEntry);
    
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Error saving entry:', err);
    res.status(400).json({ 
      message: 'Failed to save entry',
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      receivedData: req.body
    });
  }
});

// Update an entry
router.put('/:id', async (req, res) => {
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json(updatedEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an entry
router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
