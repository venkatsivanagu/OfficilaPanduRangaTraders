import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import BackNav from './BackNav';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const initialFormData = {
  vehicleNo: '',
  totalAmount: '',
  phonepeAmount: '',
  cashAmount: '',
  expenditure: '',
  profit: '',
  loss: '',
  recipientName: '',
  billDate: new Date()
};

const MyData = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = `${API_BASE_URL}/entries`;
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const validateAmounts = (data) => {
    const phonepe = parseFloat(data.phonepeAmount) || 0;
    const cash = parseFloat(data.cashAmount) || 0;
    const total = parseFloat(data.totalAmount) || 0;
    
    // Return true if amounts match, false otherwise
    return Math.abs((phonepe + cash) - total) < 0.01; // Allow for floating point precision
  };

  const [amountsMatch, setAmountsMatch] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('error'); // 'error' or 'success'
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  // Auto-hide popup after 3 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newData = {
      ...formData,
      [name]: value
    };
    
    // If any of the amount fields change, validate the amounts
    if (['phonepeAmount', 'cashAmount', 'totalAmount'].includes(name)) {
      setAmountsMatch(validateAmounts(newData));
    }
    
    setFormData(newData);
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      billDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amounts before submission
    if (!validateAmounts(formData)) {
      setPopupMessage('Error: Total amount must equal the sum of PhonePe and Cash amounts');
      setPopupType('error');
      setShowPopup(true);
      return;
    }
    
    try {
      const entryData = {
        ...formData,
        billDate: formData.billDate.toISOString()
      };
      
      if (editingId !== null) {
        // Update existing entry
        const response = await axios.put(`${API_URL}/${editingId}`, entryData);
        setEntries(entries.map(entry => 
          entry._id === editingId ? { ...response.data, billDate: new Date(response.data.billDate) } : entry
        ));
        setPopupMessage('Entry updated successfully!');
      } else {
        // Add new entry
        const response = await axios.post(API_URL, entryData);
        setEntries([{ ...response.data, billDate: new Date(response.data.billDate) }, ...entries]);
        setPopupMessage('Entry added successfully!');
      }
      
      setFormData(initialFormData);
      setEditingId(null);
      setPopupType('success');
      setShowPopup(true);
    } catch (err) {
      console.error('Error saving entry:', err);
      setPopupMessage('Failed to save entry. Please try again.');
      setPopupType('error');
      setShowPopup(true);
    }
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setEditingId(entry._id);
  };

  const handleDelete = (id) => {
    setEntryToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      const response = await axios.delete(`${API_URL}/${entryToDelete}`);
      
      if (response.status === 200) {
        setEntries(entries.filter(entry => entry._id !== entryToDelete));
        setShowDeleteDialog(false);
        setPopupMessage('Entry deleted successfully!');
        setPopupType('success');
      } else {
        throw new Error('Failed to delete entry');
      }
    } catch (err) {
      console.error('Error deleting entry:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete entry. Please try again.';
      setPopupMessage(errorMessage);
      setPopupType('error');
    } finally {
      setShowPopup(true);
      setEntryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setEntryToDelete(null);
  };

  const calculateTotal = (field) => {
    if (entries.length === 0) return '0.00';
    const total = entries.reduce((sum, entry) => {
      const value = parseFloat(entry[field]) || 0;
      return sum + value;
    }, 0);
    return total.toFixed(2);
  };

  // Fetch entries from the backend on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        console.log('Fetching entries from:', API_URL);
        const response = await axios.get(API_URL);
        console.log('API Response:', response.data);
        
        const formattedEntries = response.data.map(entry => ({
          ...entry,
          billDate: new Date(entry.billDate)
        }));
        
        console.log('Formatted entries:', formattedEntries);
        setEntries(formattedEntries);
      } catch (err) {
        const errorMsg = err.response 
          ? `Server responded with ${err.response.status}: ${err.response.data.message || 'Unknown error'}`
          : `Network error: ${err.message}`;
        
        console.error('Error fetching entries:', errorMsg, err);
        setError(`Failed to fetch entries. ${errorMsg}`);
        setPopupMessage(`Failed to load entries. ${errorMsg}`);
        setPopupType('error');
        setShowPopup(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEntries();
  }, []);

  // Fetch entries when component mounts
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        const formattedEntries = response.data.map(entry => ({
          ...entry,
          billDate: new Date(entry.billDate)
        }));
        setEntries(formattedEntries);
      } catch (err) {
        console.error('Error fetching entries:', err);
        setError('Failed to load entries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Filter bills based on date range
  const filteredBills = entries.filter(entry => {
    if (!startDate && !endDate) return true;
    
    const entryDate = new Date(entry.billDate);
    const fromDate = startDate ? new Date(startDate) : null;
    const toDate = endDate ? new Date(endDate) : null;
    
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    if (toDate) toDate.setHours(23, 59, 59, 999);
    
    return (
      (!fromDate || entryDate >= fromDate) &&
      (!toDate || entryDate <= toDate)
    );
  });

  if (loading) {
    return (
      <div className="bill-container my-data-page" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading entries...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bill-container my-data-page" style={{ textAlign: 'center', padding: '2rem' }}>
        <div className="alert alert-danger">
          <h4>Error Loading Data</h4>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bill-container my-data-page">
      <BackNav title="My Data" onBack={() => navigate(-1)} />
      
      {/* Data Entry Form */}
      <div className="data-entry-form" style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
          {editingId !== null ? 'Edit Entry' : 'Add New Entry'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleInputChange}
                placeholder="e.g., KA01AB1234"
                className="form-control"
                style={{ color: '#000' }}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Total Amount (₹) {!amountsMatch && <span style={{ color: '#e53e3e' }}>*</span>}</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className={`form-control ${!amountsMatch ? 'is-invalid' : ''}`}
                required
              />
              {!amountsMatch && (
                <small className="text-danger">
                  Total must equal PhonePe + Cash amounts
                </small>
              )}
            </div>
            
            <div className="form-group">
              <label>PhonePe (₹) {!amountsMatch && <span style={{ color: '#e53e3e' }}>*</span>}</label>
              <input
                type="number"
                name="phonepeAmount"
                value={formData.phonepeAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className={`form-control ${!amountsMatch ? 'is-invalid' : ''}`}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Cash Amount (₹) {!amountsMatch && <span style={{ color: '#e53e3e' }}>*</span>}</label>
              <input
                type="number"
                name="cashAmount"
                value={formData.cashAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className={`form-control ${!amountsMatch ? 'is-invalid' : ''}`}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Expenditure (₹)</label>
              <input
                type="number"
                name="expenditure"
                value={formData.expenditure}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Profit (₹)</label>
              <input
                type="number"
                name="profit"
                value={formData.profit}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Loss (₹)</label>
              <input
                type="number"
                name="loss"
                value={formData.loss}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={{ color: '#000' }}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleInputChange}
                placeholder="Customer name"
                style={{ color: '#000' }}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Bill Date</label>
              <DatePicker
                selected={formData.billDate}
                onChange={handleDateChange}
                dateFormat="dd/MM/yyyy"
                className="form-control"
                placeholderText="Select date"
                required
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId !== null ? 'Update Entry' : 'Add Entry'}
            </button>
            {editingId !== null && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setFormData(initialFormData);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {/* Total Balance Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '16px', fontWeight: '500' }}>Total Balance</h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>₹{calculateTotal('totalAmount')}</span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1V23M5 6H19C20.1046 6 21 6.89543 21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8C3 6.89543 3.89543 6 5 6Z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Total Expenditure Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ef4444'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '16px', fontWeight: '500' }}>Total Expenditure</h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>₹{calculateTotal('expenditure')}</span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8V4M12 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H12M9 15L11 13M11 13L13 11M11 13L9 11M11 13L13 15M16 4H20V8M20 12V18C20 19.1046 19.1046 20 18 20H12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#374151', fontSize: '16px', fontWeight: '500' }}>Remaining Balance</h4>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '24px', fontWeight: '600' }}>
              <span style={{ color: '#1f2937' }}>₹{(parseFloat(calculateTotal('totalAmount')) - parseFloat(calculateTotal('expenditure'))).toFixed(2)}</span>
            </span>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="data-filters" style={{ margin: '20px 0' }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          flexWrap: 'wrap',
          alignItems: 'flex-end'
        }}>
          <div className="form-group" style={{ flex: '1', minWidth: '180px' }}>
            <label>From Date</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              placeholderText="Select start date"
            />
          </div>
          <div className="form-group" style={{ flex: '1', minWidth: '180px' }}>
            <label>To Date</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              className="form-control"
              placeholderText="Select end date"
            />
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setStartDate(null);
              setEndDate(null);
            }}
            style={{ marginBottom: '16px' }}
          >
            Clear Dates
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="data-table-container" style={{ 
        backgroundColor: '#fff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {filteredBills.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '1000px'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <th style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: '600',
                    color: '#1f2937',
                    backgroundColor: '#f3f4f6'
                  }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Vehicle No</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Total (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>PhonePe (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Cash (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Expenditure (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Profit (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Loss (₹)</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#1f2937', backgroundColor: '#f3f4f6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((entry, index) => (
                  <tr 
                    key={entry._id} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: entry.id === editingId ? '#f0f9ff' : 'white'
                    }}
                  >
                    <td style={{ padding: '12px', color: '#718096' }}>{index + 1}</td>
                    <td style={{ padding: '12px' }}>{entry.vehicleNo || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {parseFloat(entry.totalAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {parseFloat(entry.phonepeAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {parseFloat(entry.cashAmount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {parseFloat(entry.expenditure || 0).toFixed(2)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      color: (entry.profit || 0) > 0 ? '#38a169' : 'inherit'
                    }}>
                      {(entry.profit || 0) > 0 ? parseFloat(entry.profit).toFixed(2) : '-'}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      color: (entry.loss || 0) > 0 ? '#e53e3e' : 'inherit'
                    }}>
                      {(entry.loss || 0) > 0 ? parseFloat(entry.loss).toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px' }}>{entry.recipientName || '-'}</td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {entry.billDate ? new Date(entry.billDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          type="button" 
                          onClick={() => handleEdit(entry)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            ':hover': {
                              background: '#2563eb'
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDelete(entry._id)}
                          style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            ':hover': {
                              background: '#dc2626'
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ 
                backgroundColor: '#f8fafc', 
                fontWeight: 'bold',
                borderTop: '2px solid #e2e8f0'
              }}>
                <tr>
                  <td colSpan="2" style={{ padding: '12px' }}>Total</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {calculateTotal('totalAmount')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {calculateTotal('phonepeAmount')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {calculateTotal('cashAmount')}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {calculateTotal('expenditure')}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    color: '#38a169'
                  }}>
                    {calculateTotal('profit')}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right', 
                    color: '#e53e3e'
                  }}>
                    {calculateTotal('loss')}
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#666',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            margin: '20px'
          }}>
            No entries found. Add your first entry using the form above.
          </div>
        )}
      </div>

      {/* Popup Notification */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          backgroundColor: popupType === 'error' ? '#fee2e2' : '#dcfce7',
          color: popupType === 'error' ? '#991b1b' : '#166534',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 1000,
          borderLeft: `4px solid ${popupType === 'error' ? '#ef4444' : '#22c55e'}`
        }}>
          {popupType === 'error' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>{popupMessage}</p>
          </div>
          <button 
            onClick={() => setShowPopup(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: popupType === 'error' ? '#991b1b' : '#166534',
              marginLeft: '10px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1050
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            width: '90%',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
              <path d="M12 9V11M12 15H12.01M5 7H19L18.674 15.6606C18.591 17.1636 18.319 18.6545 17.867 20.0785L17.776 20.407C17.4853 21.3902 16.6025 22.0818 15.588 22.0818H8.41199C7.39749 22.0818 6.51468 21.3902 6.22399 20.407L6.13299 20.0785C5.68046 18.6545 5.40849 17.1636 5.32599 15.6606L5 7Z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
              color: '#1f2937'
            }}>Delete Entry</h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>Are you sure you want to delete this entry? This action cannot be undone.</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#4b5563',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#f9fafb'
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#dc2626'
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyData;
