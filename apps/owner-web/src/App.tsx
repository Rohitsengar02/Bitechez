import React from 'react';
import { Store, TrendingUp, Users, DollarSign } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#FAF8F9', minHeight: '100vh' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#800D32', margin: 0, fontSize: '1.8rem' }}>Bitechez Owner & Franchise Portal</h1>
        <p style={{ color: '#6B7280', margin: '0.25rem 0 0 0' }}>Centralized Multi-Outlet Telemetry & Cloud Analytics</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase' }}>Active Outlets</span>
          <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#191923' }}>4 Locations</h2>
        </div>
        <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase' }}>Network Sales Today</span>
          <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#800D32' }}>₹1,42,800</h2>
        </div>
        <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase' }}>Offline Terminals</span>
          <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#239B56' }}>All Syncing</h2>
        </div>
        <div style={{ background: '#FFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <span style={{ fontSize: '0.8rem', color: '#6B7280', textTransform: 'uppercase' }}>Total Guests</span>
          <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0', color: '#191923' }}>482 Covers</h2>
        </div>
      </div>
    </div>
  );
};
