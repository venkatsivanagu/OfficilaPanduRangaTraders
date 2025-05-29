import React from 'react';

const BillView = ({ bill, onClose, onDelete, isDeleting }) => {
  if (!bill) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="bill-container" style={{ maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => onDelete(bill._id)} 
            disabled={isDeleting}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.4rem 1rem',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: isDeleting ? 0.7 : 1
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button 
            onClick={onClose} 
            style={{
              background: '#4a5568',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '0.4rem 1rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
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
              No: <span className="bill-input-underline">{bill.billNo}</span>
            </div>
            <div className="bill-date-row">
              Date: <span className="bill-input-underline">{bill.billDate}</span>
            </div>
          </div>
        </div>
        <hr className="bill-divider" />
        {/* Recipient Section */}
        <div className="bill-recipient-row">
          <div className="bill-recipient-to">To</div>
          <div className="bill-recipient-sri">
            Sri <span className="bill-input-underline" style={{width: '80%'}}>{bill.recipientName}</span>
          </div>
          <div className="bill-recipient-details">
            <div style={{width: '50%'}}>Vehicle No: <span className="bill-input-underline">{bill.vehicleNo}</span></div>
            <div style={{width: '50%'}}>PH: <span className="bill-input-underline">{bill.ph}</span></div>
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
              {bill.rows && bill.rows.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.srNo}</td>
                  <td>{row.description}</td>
                  <td>{row.hsn}</td>
                  <td>{row.qty}</td>
                  <td>{row.rate}</td>
                  <td>{row.amount}</td>
                  <td>{row.gstPercent}</td>
                  <td>{row.gstAmount}</td>
                  <td>{row.totalAmount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="5" className="bill-table-label">Total Basic Amount</td>
                <td colSpan="4">{bill.rows ? bill.rows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0).toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td colSpan="5" className="bill-table-label">Total Tax Amount</td>
                <td colSpan="4">{bill.rows ? bill.rows.reduce((sum, row) => sum + (parseFloat(row.gstAmount) || 0), 0).toFixed(2) : '0.00'}</td>
              </tr>
              <tr>
                <td colSpan="5" className="bill-table-label">Total Amount (INR)</td>
                <td colSpan="4">{bill.totalAmount}</td>
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
    </div>
  );
};

export default BillView; 