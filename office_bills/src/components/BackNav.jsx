import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackNav = ({ label = 'Back' }) => {
  const navigate = useNavigate();
  return (
    <button
      className="print-hidden"
      onClick={() => navigate('/dashboard')}
      style={{
        position: 'fixed',
        top: '32px',
        left: '32px',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        background: '#e9eff6',
        border: '2px solid #c3d0e8',
        borderRadius: '12px',
        color: '#22304a',
        fontSize: '1.3rem',
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none',
        padding: '0.7rem 2.2rem',
        boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
        transition: 'box-shadow 0.2s, border 0.2s',
      }}
    >
      <span style={{ fontSize: '1.3rem', marginRight: '0.7rem', lineHeight: 1, color: '#22304a' }}>&#8592;</span>
      {label}
    </button>
  );
};

export default BackNav; 