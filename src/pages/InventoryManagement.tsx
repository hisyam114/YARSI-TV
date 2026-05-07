import React from 'react';

const InventoryManagement: React.FC = () => {
  const inventoryData = [
    { id: 'CAM-01', name: 'Sony FX6', status: 'AVAILABLE', statusColor: 'var(--color-vibrant-green)' },
    { id: 'CAM-02', name: 'Sony A7S III', status: 'IN USE', statusColor: 'var(--color-outline)' },
    { id: 'MIC-01', name: 'Sennheiser MKH 416', status: 'MAINTENANCE', statusColor: 'var(--color-error)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2>Manajemen Inventaris</h2>
        <button style={{
          background: 'transparent',
          color: 'var(--color-primary)',
          border: '1px solid var(--color-primary)',
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-base)'
        }}>
          + ADD ITEM
        </button>
      </div>
      
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {inventoryData.map((item, index) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderBottom: index !== inventoryData.length - 1 ? '1px solid var(--color-border)' : 'none',
            borderLeft: `4px solid ${item.statusColor}`
          }}>
            <div>
              <span className="label-caps" style={{ color: 'var(--color-outline)' }}>{item.id}</span>
              <h4 style={{ margin: 0 }}>{item.name}</h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.statusColor }} />
              <span className="label-caps" style={{ color: item.statusColor }}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryManagement;
