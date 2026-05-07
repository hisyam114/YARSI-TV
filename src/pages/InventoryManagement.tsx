import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { fetchEquipmentData, type EquipmentItem } from '../services/googleSheets';

const InventoryManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchEquipmentData();
        setEquipment(data);
      } catch (error) {
        console.error("Failed to fetch equipment data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h2>Master Equipment</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-xs)',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-base)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          <span>ADD ITEM</span>
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>Loading Equipment...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-container)' }}>
              <tr>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>ID</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Category</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Item Name</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Condition</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Bought Date</th>
                <th className="label-caps" style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-outline)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((item, i) => (
                <tr key={i} style={{ borderBottom: i !== equipment.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}><small className="text-dim">{item.Equipment_ID}</small></td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>{item.Category}</td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontWeight: 600 }}>{item.Item_Name}</td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: item.Condition?.toLowerCase() === 'good' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                      color: item.Condition?.toLowerCase() === 'good' ? 'var(--color-vibrant-green)' : 'var(--color-error)'
                    }}>
                      {item.Condition}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: '14px' }}>{item.Bought_Date}</td>
                  <td style={{ padding: 'var(--spacing-sm) var(--spacing-md)', color: 'var(--color-outline)', fontSize: '14px' }}>{item.Notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3>Add New Equipment</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Equipment ID</label>
                <input type="text" placeholder="e.g. CAM-04" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Category</label>
                <select style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option>Kamera</option>
                  <option>Audio</option>
                  <option>Lighting</option>
                  <option>Aksesoris</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Item Name</label>
                <input type="text" placeholder="e.g. Sony A7SIII" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Condition</label>
                <select style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option>Good</option>
                  <option>Needs Repair</option>
                  <option>Broken</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Bought Date</label>
                <input type="date" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Notes</label>
                <input type="text" placeholder="Any additional details" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}>BATAL</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-base)', cursor: 'pointer', fontWeight: 600 }}>SIMPAN ITEM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
