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
    console.log('=== NEW ENTRY REQUEST ===');
    console.log('Request received at:', new Date().toISOString());
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Raw request body:', req.body);
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      const errorMsg = 'No request body received or empty body';
      console.error(errorMsg);
      return res.status(400).json({ 
        success: false,
        message: errorMsg,
        error: 'INVALID_REQUEST_BODY',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Received request body type:', typeof req.body);
    console.log('Received request body keys:', Object.keys(req.body));
    
    // Normalize request body
    const entryData = {
      vehicleNo: String(req.body.vehicleNo || ''),
      totalAmount: parseFloat(req.body.totalAmount) || 0,
      phonepeAmount: parseFloat(req.body.phonepeAmount) || 0,
      cashAmount: parseFloat(req.body.cashAmount) || 0,
      expenditure: parseFloat(req.body.expenditure) || 0,
      profit: parseFloat(req.body.profit) || 0,
      loss: parseFloat(req.body.loss) || 0,
      recipientName: String(req.body.recipientName || ''),
      billDate: req.body.billDate ? new Date(req.body.billDate) : new Date(),
      notes: String(req.body.notes || '')
    };
    
    console.log('Normalized entry data:', JSON.stringify(entryData, null, 2));
    
    // Define required fields
    const requiredFields = [
      'vehicleNo', 
      'totalAmount', 
      'phonepeAmount', 
      'cashAmount', 
      'expenditure', 
      'recipientName', 
      'billDate'
    ];
    
    // Check for missing fields
    const missingFields = requiredFields.filter(field => {
      const value = entryData[field];
      return value === undefined || 
             value === null || 
             (typeof value === 'string' && value.trim() === '') ||
             (typeof value === 'number' && isNaN(value));
    });
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing or invalid required fields: ${missingFields.join(', ')}`;
      console.error(errorMsg);
      return res.status(400).json({ 
        success: false,
        message: errorMsg,
        missingFields: missingFields,
        receivedData: req.body,
        normalizedData: entryData,
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create new entry with normalized data
    console.log('Creating new entry with data:', JSON.stringify(entryData, null, 2));
    
    const entry = new Entry(entryData);
    
    try {
      const newEntry = await entry.save();
      console.log('Entry created successfully:', newEntry._id);
      
      res.status(201).json({
        success: true,
        message: 'Entry created successfully',
        data: newEntry,
        timestamp: new Date().toISOString()
      });
    } catch (saveError) {
      console.error('Database save error:', saveError);
      
      // Handle duplicate key errors
      if (saveError.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Entry with these details already exists',
          error: 'DUPLICATE_ENTRY',
          details: saveError.keyValue,
          timestamp: new Date().toISOString()
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => ({
          field: err.path,
          message: err.message,
          type: err.kind
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          validationErrors: validationErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      throw saveError; // Re-throw for the outer catch block
    }
  } catch (err) {
    console.error('Unexpected error in POST /:', err);
    
    res.status(500).json({ 
      success: false, 
      message: 'An unexpected error occurred while creating the entry',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
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
