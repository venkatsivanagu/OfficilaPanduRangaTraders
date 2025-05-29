import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './NewBillStyles.css';
import './PrintStyles.css';
import BackNav from './BackNav';

const initialRow = {
  srNo: '',
  description: '',
  hsn: '',
  qty: '',
  rate: '',
  amount: '',
  gstPercent: '',
  gstAmount: '',
  totalAmount: '',
};

const NewBill = () => {
  const [rows, setRows] = useState([{ ...initialRow }]);
  const [billDate, setBillDate] = useState(null);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  // Refs for reliable value access
  const billNoRef = useRef();
  const recipientNameRef = useRef();
  const vehicleNoRef = useRef();
  const phRef = useRef();

  // Calculate totals
  const totalBasic = rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const totalTax = rows.reduce((sum, row) => sum + (parseFloat(row.gstAmount) || 0), 0);
  const totalAmount = rows.reduce((sum, row) => sum + (parseFloat(row.totalAmount) || 0), 0);

  const handleRowChange = (idx, field, value) => {
    const updatedRows = rows.map((row, i) => {
      if (i !== idx) return row;
      const updated = { ...row, [field]: value };
      // Auto-calculate fields
      const qty = parseFloat(updated.qty) || 0;
      const rate = parseFloat(updated.rate) || 0;
      const amount = qty * rate;
      const gstPercent = parseFloat(updated.gstPercent) || 0;
      const gstAmount = amount * (gstPercent / 100);
      const totalAmount = amount + gstAmount;
      return {
        ...updated,
        amount: (!isNaN(amount) && amount !== 0) ? amount.toFixed(2) : '',
        gstAmount: gstPercent ? gstAmount.toFixed(2) : '',
        totalAmount: (amount || gstAmount) ? totalAmount.toFixed(2) : '',
      };
    });
    // Auto-add new row if last row is filled
    if (
      idx === rows.length - 1 &&
      field !== 'srNo' &&
      Object.values(updatedRows[idx]).some(val => val !== '') &&
      !updatedRows[rows.length]
    ) {
      setRows([...updatedRows, { ...initialRow }]);
    } else {
      setRows(updatedRows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveBill = async () => {
  
    // Gather bill data
    const billNo = billNoRef.current?.value || '';
    const billDateStr = billDate ? billDate.toISOString().split('T')[0] : '';
    const recipientName = recipientNameRef.current?.value || '';
    const vehicleNo = vehicleNoRef.current?.value || '';
    const ph = phRef.current?.value || '';
    const totalAmountStr = totalAmount ? totalAmount.toFixed(2) : '';
    const billData = {
      billNo,
      billDate: billDateStr,
      recipientName,
      vehicleNo,
      ph,
      totalAmount: totalAmountStr,
      rows: rows.filter(row => Object.values(row).some(val => val !== '')),
    };

    try {
      const response = await fetch('http://localhost:5000/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        throw new Error('Failed to save bill');
      }

    setShowSavedPopup(true);
    setTimeout(() => setShowSavedPopup(false), 2000);

      // Reset form fields after successful save
      if (billNoRef.current) billNoRef.current.value = '';
      if (recipientNameRef.current) recipientNameRef.current.value = '';
      if (vehicleNoRef.current) vehicleNoRef.current.value = '';
      if (phRef.current) phRef.current.value = '';
      setBillDate(null);
      setRows([{ ...initialRow }]);
    } catch (error) {
      console.error('Error saving bill:', error);
      alert('Failed to save bill. Please try again.');
    }
  };

  return (
    <div className="bill-container">
      <BackNav />
      {showSavedPopup && (
        <div style={{
          position: 'fixed',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#38a169',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(44,62,80,0.15)',
          zIndex: 2000,
          fontSize: '1.2rem',
          fontWeight: 600,
        }}>
          Bill saved successfully!
        </div>
      )}
      <div className="bill-action-buttons print-hidden">
      <button 
        className="print-button" 
        onClick={handlePrint}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
            marginBottom: '14px',
            transition: 'box-shadow 0.2s, border 0.2s',
        }}
      >
        Print Bill
      </button>
      <button
        className="save-bill-button"
        onClick={handleSaveBill}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
            transition: 'box-shadow 0.2s, border 0.2s',
        }}
      >
        Save Bill
      </button>
      </div>
      {/* Header Section */}
      <div className="bill-header-row">
        <div>
          <div className="bill-title">BILL OF SUPPLY</div>
          <div className="bill-subtitle">( <span>Under Composition Scheme</span> )</div>
        </div>
        <div className="bill-gstin">GSTIN: <span>37CQDPV7165G1ZB</span></div>
      </div>
      <hr className="bill-divider" />
      {/* Info Section */}
      <div className="bill-info-row">
        <div className="bill-info-left">
          <div className="bill-label">Cell: <span>7981853525</span></div>
          <div className="bill-label">E-mail: <span>vamsi7654321@gmail.com</span></div>
          <div className="bill-business-name">PANDU RANGA TRADERS</div>
          <div className="bill-address">
            Near Autonagar, 4th bridge Highway,<br />
            Diwancheruvu, East Godavari, A.P.<br />
            Pincode - 533296
          </div>
        </div>
        <div className="bill-info-right">
          <div className="bill-no-row">
            No: <input className="bill-input-underline" type="text" placeholder="" ref={billNoRef} />
          </div>
          <div className="bill-date-row">
            Date: <DatePicker
              selected={billDate}
              onChange={date => setBillDate(date)}
              className="bill-input-underline"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select date"
            />
          </div>
        </div>
      </div>
      <hr className="bill-divider" />
      {/* Recipient Section */}
      <div className="bill-recipient-row">
        <div className="bill-recipient-to">To</div>
        <div className="bill-recipient-sri">
          Sri <input className="bill-input-underline" type="text" style={{width: '80%'}} ref={recipientNameRef} />
        </div>
        <div className="bill-recipient-details">
          <div style={{width: '50%'}}>Vehicle No: <input className="bill-input-underline" type="text" ref={vehicleNoRef} /></div>
          <div style={{width: '50%'}}>PH: <input className="bill-input-underline" type="text" ref={phRef} /></div>
        </div>
      </div>
      <hr className="bill-divider" />
      {/* Items Table Section */}
      <div className="bill-table-section">
        <table className="bill-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Item Name & Description</th>
              <th>HSN Code</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>GST %</th>
              <th>GST Amount</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isLastBlank = idx === rows.length - 1 && Object.values(row).every(val => val === '');
              return (
                <tr key={idx} className={isLastBlank ? 'print-hidden' : ''}>
                  <td><input className="bill-input-table" type="number" value={row.srNo} onChange={e => handleRowChange(idx, 'srNo', e.target.value)} /></td>
                  <td>
                    <textarea
                      className="bill-input-table"
                      rows="2"
                      value={row.description}
                      onChange={e => {
                        handleRowChange(idx, 'description', e.target.value);
                        // Auto-expand textarea
                        e.target.style.height = '2.2em';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                    />
                  </td>
                  <td><input className="bill-input-table" type="text" value={row.hsn} onChange={e => handleRowChange(idx, 'hsn', e.target.value)} /></td>
                  <td><input className="bill-input-table" type="number" value={row.qty} onChange={e => handleRowChange(idx, 'qty', e.target.value)} /></td>
                  <td><input className="bill-input-table" type="number" value={row.rate} onChange={e => handleRowChange(idx, 'rate', e.target.value)} /></td>
                  <td><input className="bill-input-table" type="number" value={row.amount} readOnly /></td>
                  <td><input className="bill-input-table" type="number" value={row.gstPercent} onChange={e => handleRowChange(idx, 'gstPercent', e.target.value)} /></td>
                  <td><input className="bill-input-table" type="number" value={row.gstAmount} readOnly /></td>
                  <td><input className="bill-input-table" type="number" value={row.totalAmount} readOnly /></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="5" className="bill-table-label">Total Basic Amount</td>
              <td colSpan="4"><input className="bill-input-table" type="number" value={totalBasic.toFixed(2)} readOnly /></td>
            </tr>
            <tr>
              <td colSpan="5" className="bill-table-label">Total Tax Amount</td>
              <td colSpan="4"><input className="bill-input-table" type="number" value={totalTax.toFixed(2)} readOnly /></td>
            </tr>
            <tr>
              <td colSpan="5" className="bill-table-label">Total Amount (INR)</td>
              <td colSpan="4"><input className="bill-input-table" type="number" value={totalAmount.toFixed(2)} readOnly /></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <hr className="bill-divider" />
      {/* Signature Section */}
      <div className="bill-signature-row">
        <div className="bill-signature-left">
          <div className="bill-signature-label-row">
            Receiver's Signature: <span className="bill-signature-underline"></span>
          </div>
          <div className="bill-signature-label-row">
            Name: <span className="bill-signature-underline"></span>
          </div>
        </div>
        <div className="bill-signature-right">
          <div>PANDU RANGA TRADERS</div>
          <div className="bill-signature-label-row">
            Signature: <span className="bill-signature-underline"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBill; 