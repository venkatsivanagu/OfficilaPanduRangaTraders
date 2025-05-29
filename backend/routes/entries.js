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
    const entry = new Entry(req.body);
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
