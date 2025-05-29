import React, { useEffect, useState } from 'react';
import BillView from './BillView';
import BackNav from './BackNav';
import ConfirmationDialog from './ConfirmationDialog';
import Notification from './Notification';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SavedBills = () => {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/bills');
        if (!response.ok) {
          throw new Error('Failed to fetch bills');
        }
        const data = await response.json();
        setBills(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setError('Failed to load bills. Please try again later.');
        setLoading(false);
    }
    };

    fetchBills();
  }, []);

  const filteredBills = bills.filter(bill =>
    (bill.vehicleNo || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteClick = (billId) => {
    setBillToDelete(billId);
  };

  const confirmDelete = async () => {
    if (!billToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:5000/api/bills/${billToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }

      // Remove the deleted bill from the state
      setBills(bills.filter(bill => bill._id !== billToDelete));
      setSelectedBill(null); // Close the bill view
      setBillToDelete(null); // Close the confirmation dialog
      
      // Show success notification
      setNotification({ show: true, message: 'Bill deleted successfully!' });
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error deleting bill:', error);
      alert('Failed to delete bill. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setBillToDelete(null);
  };

  if (loading) {
    return <div className="bill-container saved-bills-page">Loading...</div>;
  }

  if (error) {
    return <div className="bill-container saved-bills-page">{error}</div>;
  }

  return (
    <div className="bill-container saved-bills-page">
      <BackNav />
      <h2>Saved Bills</h2>
      <div className="search-container">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search by Vehicle Number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="date-picker-container">
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            placeholderText="Select date"
            dateFormat="dd/MM/yyyy"
            className="custom-datepicker"
            wrapperClassName="date-picker-wrapper"
            calendarClassName="custom-calendar"
          />
        </div>
        <div className="clear-button-container">
          <button 
            onClick={() => setSelectedDate(null)}
            className="clear-button"
          >
            Clear
          </button>
        </div>
      </div>
      {filteredBills.length === 0 ? (
        <p>No bills found.</p>
      ) : (
        <div className="bill-card-list">
          {filteredBills.map((bill) => (
            <div
              className="bill-card"
              key={bill._id}
              onClick={() => setSelectedBill(bill)}
            >
              <div style={{ color: '#22304a', fontSize: '1.2rem', marginBottom: '0.3rem' }}>Vehicle No:</div>
              <div style={{ color: '#007bff', fontSize: '1.3rem', wordBreak: 'break-all' }}>{bill.vehicleNo || 'N/A'}</div>
            </div>
          ))}
        </div>
      )}
      {selectedBill && (
        <BillView 
          bill={selectedBill} 
          onClose={() => setSelectedBill(null)}
          onDelete={handleDeleteClick}
          isDeleting={isDeleting}
        />
      )}
      
      <ConfirmationDialog
        isOpen={!!billToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
      
      {notification.show && (
        <Notification 
          message={notification.message} 
          type="success" 
          onClose={() => setNotification({ show: false, message: '' })}
        />
      )}
    </div>
  );
};

export default SavedBills; 