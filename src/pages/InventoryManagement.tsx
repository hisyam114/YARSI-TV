import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, FileText, RefreshCw } from 'lucide-react';
import { fetchEquipmentData, executeApi, fetchEquipmentUsageData, type EquipmentItem, type EquipmentUsageRecord } from '../services/googleSheets';
import { showToast } from '../utils/toast';
import jsPDF from 'jspdf';

const formatDateToDDMMYYYY = (dateString?: string) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString; // Already in DD/MM/YYYY or unknown format
};

const InventoryManagement: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Equipment Usage Form State
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageForm, setUsageForm] = useState({
    borrowerName: '',
    dateOfUse: new Date().toISOString().split('T')[0],
    eventName: '',
    activityType: 'Streaming',
    letterNumber: ''
  });
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Equipment Usage Records State
  const [usageRecords, setUsageRecords] = useState<EquipmentUsageRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Category prefix mapping
  const categoryPrefixes: Record<string, string> = {
    'Kamera': 'CAM',
    'Audio': 'AUD',
    'Lighting': 'LGT',
    'Aksesoris': 'ACC'
  };

  // Generate next equipment ID based on category
  const getNextEquipmentId = (category: string): string => {
    const prefix = categoryPrefixes[category] || 'EQ';
    const existingIds = equipment
      .filter(e => e.Equipment_ID?.startsWith(prefix))
      .map(e => {
        const match = e.Equipment_ID?.match(new RegExp(`^${prefix}-(\\d+)$`));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));
    
    const maxNumber = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const nextNumber = maxNumber + 1;
    
    return `${prefix}-${String(nextNumber).padStart(2, '0')}`;
  };

  // Generate letter number based on format: 001/05/YTV/2026
  const generateLetterNumber = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const storageKey = `equipment_form_sequence_${month}_${year}`;
    
    // Get current sequence number for this month/year
    let sequence = parseInt(localStorage.getItem(storageKey) || '0', 10);
    sequence += 1;
    
    // Save updated sequence
    localStorage.setItem(storageKey, String(sequence));
    
    const sequenceStr = String(sequence).padStart(3, '0');
    return `${sequenceStr}/${month}/YTV/${year}`;
  };

  // Fetch equipment usage records
  const fetchUsageRecords = async () => {
    setLoadingRecords(true);
    try {
      const data = await fetchEquipmentUsageData();
      setUsageRecords(data);
    } catch (error) {
      console.error("Failed to fetch usage records", error);
      showToast('Failed to load usage records', 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

  const initialFormState: EquipmentItem = {
    Equipment_ID: '', Category: 'Kamera', Item_Name: '', Condition: 'Good', Bought_Date: '', Notes: ''
  };
  const [formData, setFormData] = useState<EquipmentItem>(initialFormState);
  
  const activityOptions = [
    'Streaming',
    'Documentation',
    'Streaming & Documentation',
    'Activities/Events'
  ];

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

    // Load usage records
    fetchUsageRecords();
  }, []);

  const handleOpenModal = (item?: EquipmentItem) => {
    if (item) {
      setFormData(item);
      setIsEditing(true);
    } else {
      // Auto-generate equipment ID based on selected category
      const nextId = getNextEquipmentId(formData.Category);
      setFormData({ ...initialFormState, Equipment_ID: nextId });
      setIsEditing(false);
    }
    setShowAddModal(true);
  };

  // Handle category change to regenerate equipment ID
  const handleCategoryChange = (newCategory: string) => {
    if (!isEditing) {
      const newId = getNextEquipmentId(newCategory);
      setFormData({ ...formData, Category: newCategory, Equipment_ID: newId });
    } else {
      setFormData({ ...formData, Category: newCategory });
    }
  };

  const handleSave = async () => {
    if (!formData.Equipment_ID || !formData.Item_Name) {
      alert("Please fill Equipment ID and Item Name");
      return;
    }
    setIsSaving(true);
    
    if (isEditing) {
      const success = await executeApi('Master_Equipment', 'update', formData);
      if (success) {
        setEquipment(prev => prev.map(e => e.Equipment_ID === formData.Equipment_ID ? formData : e));
        setShowAddModal(false);
        showToast(`Equipment "${formData.Item_Name}" updated.`, 'success');
      } else {
        showToast('Failed to update equipment.', 'error');
      }
    } else {
      if (equipment.find(e => e.Equipment_ID === formData.Equipment_ID)) {
        alert("Equipment ID already exists!");
        setIsSaving(false);
        return;
      }
      const success = await executeApi('Master_Equipment', 'create', formData);
      if (success) {
        setEquipment(prev => [...prev, formData]);
        setShowAddModal(false);
        showToast(`Equipment "${formData.Item_Name}" added.`, 'success');
      } else {
        showToast('Failed to add equipment.', 'error');
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Are you sure you want to delete equipment ${id}?`)) {
      const itemToDelete = equipment.find(e => e.Equipment_ID === id);
      if (itemToDelete) {
        const success = await executeApi('Master_Equipment', 'delete', itemToDelete);
        if (success) {
          setEquipment(prev => prev.filter(e => e.Equipment_ID !== id));
          showToast(`Equipment "${itemToDelete.Item_Name}" deleted.`, 'info');
        } else {
          showToast('Failed to delete equipment.', 'error');
        }
      }
    }
  };

  const toggleEquipmentSelection = (equipmentId: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const generatePDF = async () => {
    if (!usageForm.borrowerName || !usageForm.eventName) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (selectedEquipment.length === 0) {
      showToast('Please select at least one equipment', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Header with YARSI TV branding
      doc.setFillColor(0, 100, 50);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('YARSI TV', pageWidth / 2, 12, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Equipment Usage Form 2026', pageWidth / 2, 20, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      
      // Letter Number
      let yPos = 40;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`No: ${usageForm.letterNumber}`, margin, yPos);
      yPos += 10;
      
      // Form title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FORM PENGGUNAAN PERALATAN', pageWidth / 2, yPos, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('(Equipment Usage Form)', pageWidth / 2, yPos + 5, { align: 'center' });
      
      yPos += 15;

      // Borrower Details Section
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
      
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAIL PEMINJAM / BORROWER DETAILS', margin + 3, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Two column layout for details
      const col1X = margin + 3;
      const col2X = pageWidth / 2 + 5;
      
      doc.text('Nama Peminjam:', col1X, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(usageForm.borrowerName, col1X + 35, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Tanggal:', col2X, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatDateToDDMMYYYY(usageForm.dateOfUse), col2X + 20, yPos);
      
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.text('Nama Kegiatan:', col1X, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(usageForm.eventName, col1X + 35, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.text('Jenis Kegiatan:', col2X, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(usageForm.activityType, col2X + 30, yPos);
      
      yPos += 15;
      
      // Equipment list title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('DAFTAR PERALATAN / EQUIPMENT LIST', margin, yPos);
      yPos += 5;

      // Table header
      doc.setFillColor(0, 100, 50);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      const colNo = margin + 2;
      const colID = margin + 12;
      const colName = margin + 35;
      const colCategory = margin + 110;
      const colCondition = margin + 145;
      
      doc.text('No', colNo, yPos + 5);
      doc.text('Equipment ID', colID, yPos + 5);
      doc.text('Nama Peralatan', colName, yPos + 5);
      doc.text('Kategori', colCategory, yPos + 5);
      doc.text('Kondisi', colCondition, yPos + 5);
      
      doc.setTextColor(0, 0, 0);
      yPos += 8;

      // Equipment items
      const selectedItems = equipment.filter(e => selectedEquipment.includes(e.Equipment_ID));
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      selectedItems.forEach((item, index) => {
        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = 20;
        }
        
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
        }
        
        doc.text(String(index + 1), colNo, yPos + 5);
        doc.text(item.Equipment_ID, colID, yPos + 5);
        doc.text(item.Item_Name.substring(0, 35), colName, yPos + 5);
        doc.text(item.Category, colCategory, yPos + 5);
        doc.text(item.Condition, colCondition, yPos + 5);
        yPos += 7;
      });

      yPos += 8;
      
      // Provisions section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('KETENTUAN / PROVISIONS', margin, yPos);
      yPos += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const provisions = [
        '1. Peminjam bertanggung jawab penuh atas peralatan yang dipinjam.',
        '2. Kerusakan atau kehilangan peralatan menjadi tanggung jawab peminjam.',
        '3. Peralatan harus dikembalikan dalam kondisi baik setelah digunakan.',
        '4. Penggunaan peralatan harus sesuai dengan prosedur yang berlaku.'
      ];
      
      provisions.forEach(provision => {
        doc.text(provision, margin, yPos);
        yPos += 5;
      });

      yPos += 10;
      
      // Signature section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('TANDA TANGAN / SIGNATURES', margin, yPos);
      yPos += 8;

      // Signature boxes
      const boxWidth = 70;
      const boxHeight = 30;
      const leftBoxX = margin + 10;
      const rightBoxX = pageWidth - margin - boxWidth - 10;
      
      // Left box - Borrower
      doc.setLineWidth(0.5);
      doc.rect(leftBoxX, yPos, boxWidth, boxHeight);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Peminjam / Borrower', leftBoxX + boxWidth / 2, yPos + 6, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(usageForm.borrowerName, leftBoxX + boxWidth / 2, yPos + boxHeight - 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('(Tanda Tangan & Nama)', leftBoxX + boxWidth / 2, yPos + boxHeight - 3, { align: 'center' });

      // Right box - Management
      doc.setLineWidth(0.5);
      doc.rect(rightBoxX, yPos, boxWidth, boxHeight);
      doc.setFontSize(8);
      doc.text('Manajemen YARSI TV', rightBoxX + boxWidth / 2, yPos + 6, { align: 'center' });
      doc.text('Management', rightBoxX + boxWidth / 2, yPos + boxHeight - 8, { align: 'center' });
      doc.setFontSize(7);
      doc.text('(Tanda Tangan & Nama)', rightBoxX + boxWidth / 2, yPos + boxHeight - 3, { align: 'center' });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text('YARSI TV Equipment Management System', pageWidth / 2, pageHeight - 5, { align: 'center' });

      // Save the PDF
      const fileName = `YARSI-TV-Form-${usageForm.letterNumber.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      // Save to spreadsheet
      const equipmentDetails = selectedItems.map(item => item.Item_Name).join(', ');
      const record = {
        NOMOR_SURAT: usageForm.letterNumber,
        NAMA_PIC: usageForm.borrowerName,
        TANGGAL: formatDateToDDMMYYYY(usageForm.dateOfUse),
        KEGIATAN: usageForm.activityType,
        NAMA_KEGIATAN: usageForm.eventName,
        DETAIL_ALAT: equipmentDetails
      };
      
      const success = await executeApi('Data_Penggunaan_Alat', 'create', record);
      if (success) {
        showToast('PDF generated and data saved to spreadsheet!', 'success');
        // Refresh the records table
        fetchUsageRecords();
      } else {
        showToast('PDF generated but failed to save to spreadsheet', 'warning');
      }
      
      setShowUsageModal(false);
      
      // Reset form
      setUsageForm({
        borrowerName: '',
        dateOfUse: new Date().toISOString().split('T')[0],
        eventName: '',
        activityType: 'Streaming',
        letterNumber: ''
      });
      setSelectedEquipment([]);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Failed to generate PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container-padding" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'var(--spacing-md)',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)'
      }}>
        <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 24px)' }}>Master Equipment</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <button 
            onClick={() => handleOpenModal()}
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
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            <span>Tambahkan Alat</span>
          </button>
          
          <button 
            onClick={() => {
              const letterNum = generateLetterNumber();
              setUsageForm({
                borrowerName: '',
                dateOfUse: new Date().toISOString().split('T')[0],
                eventName: '',
                activityType: 'Streaming',
                letterNumber: letterNum
              });
              setSelectedEquipment([]);
              setShowUsageModal(true);
            }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-xs)',
              background: 'var(--color-orange-primary)',
              color: 'var(--color-on-surface)',
              border: 'none',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-base)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,255,65,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FileText size={18} />
            <span>Form Pemakaian Alat</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {/* Skeleton Loading Animation */}
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="glass-panel responsive-grid" 
              style={{ 
                gridTemplateColumns: '100px 150px 2fr 150px 150px 1fr 100px',
                alignItems: 'center',
                padding: 'var(--spacing-md)', 
                gap: 'var(--spacing-md)',
                backgroundColor: 'var(--color-surface-container)',
                textAlign: 'center',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
            </div>
          ))}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {/* Desktop Header */}
          <div className="desktop-grid" style={{ 
            gridTemplateColumns: '100px 150px 2fr 150px 150px 1fr 100px', 
            padding: 'var(--spacing-sm) var(--spacing-md)', 
            color: 'var(--color-outline)',
            gap: 'var(--spacing-md)',
            textAlign: 'center',
            borderBottom: '2px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span className="label-caps">ID</span>
            <span className="label-caps">Category</span>
            <span className="label-caps" style={{ textAlign: 'left' }}>Item Name</span>
            <span className="label-caps">Condition</span>
            <span className="label-caps">Bought Date</span>
            <span className="label-caps">Notes</span>
            <span className="label-caps" style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {equipment.map((item, i) => (
            <div 
              key={i} 
              className="glass-panel responsive-grid" 
              style={{ 
                gridTemplateColumns: '100px 150px 2fr 150px 150px 1fr 100px',
                alignItems: 'center',
                padding: 'var(--spacing-md)', 
                gap: 'var(--spacing-md)',
                backgroundColor: 'var(--color-surface-container)',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'}
            >
              <div className="mobile-hide"><small className="text-dim">{item.Equipment_ID}</small></div>
              
              <div style={{ textAlign: 'left' }}>
                <div className="label-caps tablet-show" style={{ display: 'none', fontSize: '10px', color: 'var(--color-outline)', marginBottom: '4px' }}>
                  {item.Category} • {item.Equipment_ID}
                </div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>{item.Item_Name}</h3>
              </div>

              <div className="mobile-hide label-caps" style={{ fontSize: '11px' }}>{item.Category}</div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: item.Condition?.toLowerCase() === 'good' ? 'rgba(0, 255, 65, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                  color: item.Condition?.toLowerCase() === 'good' ? 'var(--color-vibrant-green)' : 'var(--color-error)',
                  whiteSpace: 'nowrap'
                }}>
                  {item.Condition}
                </span>
              </div>

              <div className="mobile-hide" style={{ fontSize: '13px' }}>{formatDateToDDMMYYYY(item.Bought_Date)}</div>
              
              <div style={{ textAlign: 'left' }}>
                <div className="text-dim" style={{ fontSize: '13px' }}>{item.Notes}</div>
                <div className="tablet-show text-dim" style={{ display: 'none', fontSize: '11px', marginTop: '4px' }}>
                  Purchased: {formatDateToDDMMYYYY(item.Bought_Date)}
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => handleOpenModal(item)} 
                  style={{ 
                    background: 'var(--color-surface-container-high)', 
                    border: '1px solid var(--color-border)', 
                    color: 'var(--color-on-surface)', 
                    cursor: 'pointer', 
                    padding: '6px', 
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-primary)';
                    e.currentTarget.style.color = 'var(--color-on-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-container-high)';
                    e.currentTarget.style.color = 'var(--color-on-surface)';
                  }}
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(item.Equipment_ID)} 
                  style={{ 
                    background: 'var(--color-surface-container-high)', 
                    border: '1px solid var(--color-border)', 
                    color: 'var(--color-error)', 
                    cursor: 'pointer', 
                    padding: '6px', 
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-error)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-container-high)';
                    e.currentTarget.style.color = 'var(--color-error)';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {equipment.length === 0 && (
            <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
              No equipment found.
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '500px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <h3>{isEditing ? 'Edit Alat' : 'Tambah Alat Baru'}</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Equipment ID</label>
                <input type="text" value={formData.Equipment_ID} readOnly onChange={e => setFormData({...formData, Equipment_ID: e.target.value})} disabled={true} placeholder="e.g. CAM-04" style={{ background: 'var(--color-surface-container)', color: 'var(--color-primary)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', opacity: isEditing ? 0.5 : 1 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Category</label>
                <select value={formData.Category} onChange={e => handleCategoryChange(e.target.value)} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option>Kamera</option>
                  <option>Audio</option>
                  <option>Lighting</option>
                  <option>Aksesoris</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Item Name</label>
                <input type="text" value={formData.Item_Name} onChange={e => setFormData({...formData, Item_Name: e.target.value})} placeholder="e.g. Sony A7SIII" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Condition</label>
                <select value={formData.Condition} onChange={e => setFormData({...formData, Condition: e.target.value})} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <option>Good</option>
                  <option>Needs Repair</option>
                  <option>Broken</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Bought Date</label>
                <input type="date" value={formData.Bought_Date} onChange={e => setFormData({...formData, Bought_Date: e.target.value})} style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', colorScheme: 'dark' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <label className="label-caps text-dim" style={{ color: 'var(--color-outline)' }}>Notes</label>
                <input type="text" value={formData.Notes} onChange={e => setFormData({...formData, Notes: e.target.value})} placeholder="Any additional details" style={{ background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} disabled={isSaving} style={{ padding: '8px 16px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>BATAL</button>
                <button type="button" onClick={handleSave} disabled={isSaving} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--radius-base)', cursor: isSaving ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isSaving ? 0.5 : 1 }}>
                  {isSaving ? 'MENYIMPAN...' : 'SIMPAN ALAT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Usage Form Modal */}
      {showUsageModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          overflowY: 'auto', padding: 'var(--spacing-md)'
        }}>
          <div className="glass-panel" style={{ padding: 'var(--spacing-lg)', width: '100%', maxWidth: '700px', backgroundColor: 'var(--color-surface-container-lowest)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
              <div>
                <h3 style={{ margin: 0 }}>Equipment Usage Form 2026</h3>
                <p className="text-dim" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Form Penggunaan Peralatan YARSI TV</p>
              </div>
              <button onClick={() => setShowUsageModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-outline)', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {/* Letter Number Display */}
              <div style={{ 
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #006400 100%)', 
                padding: 'var(--spacing-md)', 
                borderRadius: 'var(--radius-md)',
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>NOMOR SURAT / LETTER NUMBER</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>{usageForm.letterNumber}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>YARSI TV 2026</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Form Penggunaan Peralatan</div>
                </div>
              </div>

              {/* Borrower Details */}
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-primary)' }}>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '14px' }}>Detail Peminjam / Borrower Details</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <label className="label-caps text-dim" style={{ fontSize: '11px' }}>Nama Peminjam / PIC *</label>
                    <input 
                      type="text" 
                      value={usageForm.borrowerName} 
                      onChange={e => setUsageForm({...usageForm, borrowerName: e.target.value})}
                      placeholder="Enter borrower name"
                      style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      <label className="label-caps text-dim" style={{ fontSize: '11px' }}>Tanggal Penggunaan *</label>
                      <input 
                        type="date" 
                        value={usageForm.dateOfUse} 
                        onChange={e => setUsageForm({...usageForm, dateOfUse: e.target.value})}
                        style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', colorScheme: 'dark' }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                      <label className="label-caps text-dim" style={{ fontSize: '11px' }}>Jenis Kegiatan *</label>
                      <select 
                        value={usageForm.activityType} 
                        onChange={e => setUsageForm({...usageForm, activityType: e.target.value})}
                        style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                      >
                        {activityOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                    <label className="label-caps text-dim" style={{ fontSize: '11px' }}>Nama Kegiatan / Event *</label>
                    <input 
                      type="text" 
                      value={usageForm.eventName} 
                      onChange={e => setUsageForm({...usageForm, eventName: e.target.value})}
                      placeholder="Enter event name"
                      style={{ background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
                    />
                  </div>
                </div>
              </div>

              {/* Equipment Selection */}
              <div style={{ background: 'var(--color-surface-container)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-vibrant-green)' }}>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0', fontSize: '14px' }}>Select Equipment ({selectedEquipment.length} selected)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)', maxHeight: '300px', overflowY: 'auto' }}>
                  {equipment.filter(e => e.Condition?.toLowerCase() === 'good').map(item => (
                    <label 
                      key={item.Equipment_ID}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--spacing-sm)', 
                        background: selectedEquipment.includes(item.Equipment_ID) ? 'var(--color-surface-container-high)' : 'transparent',
                        padding: 'var(--spacing-sm)', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer',
                        border: selectedEquipment.includes(item.Equipment_ID) ? '1px solid var(--color-vibrant-green)' : '1px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-container-high)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = selectedEquipment.includes(item.Equipment_ID) ? 'var(--color-surface-container-high)' : 'transparent'}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedEquipment.includes(item.Equipment_ID)}
                        onChange={() => toggleEquipmentSelection(item.Equipment_ID)}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-vibrant-green)', cursor: 'pointer' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.Item_Name}</div>
                        <div className="text-dim" style={{ fontSize: '11px' }}>{item.Equipment_ID} • {item.Category}</div>
                      </div>
                    </label>
                  ))}
                  
                  {equipment.filter(e => e.Condition?.toLowerCase() === 'good').length === 0 && (
                    <div className="text-dim" style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                      No equipment available in good condition
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
                <button 
                  type="button" 
                  onClick={() => setShowUsageModal(false)} 
                  disabled={isGenerating}
                  style={{ padding: '10px 20px', background: 'transparent', color: 'var(--color-on-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-base)', cursor: isGenerating ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: isGenerating ? 0.5 : 1 }}
                >
                  CANCEL
                </button>
                <button 
                  type="button" 
                  onClick={generatePDF} 
                  disabled={isGenerating}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '10px 20px', 
                    background: 'var(--color-vibrant-green)', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: 'var(--radius-base)', 
                    cursor: isGenerating ? 'not-allowed' : 'pointer', 
                    fontWeight: 600,
                    opacity: isGenerating ? 0.5 : 1
                  }}
                >
                  <FileText size={18} />
                  {isGenerating ? 'GENERATING PDF...' : 'GENERATE PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Usage Records Table */}
      <div style={{ marginTop: 'var(--spacing-xl)', paddingTop: 'var(--spacing-xl)', borderTop: '2px solid var(--color-border)' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 'var(--spacing-md)',
          flexWrap: 'wrap',
          gap: 'var(--spacing-sm)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 22px)' }}>Equipment Usage Records</h2>
            <p className="text-dim" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Riwayat Penggunaan Peralatan</p>
          </div>
          <button 
            onClick={fetchUsageRecords}
            disabled={loadingRecords}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-xs)',
              background: 'var(--color-surface-container-high)',
              color: 'var(--color-on-surface)',
              border: '1px solid var(--color-border)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-base)',
              fontWeight: 600,
              cursor: loadingRecords ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              opacity: loadingRecords ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!loadingRecords) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <RefreshCw size={18} style={{ animation: loadingRecords ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loadingRecords ? 'LOADING...' : 'REFRESH'}</span>
          </button>
        </div>

        {loadingRecords ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="glass-panel" 
                style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-surface-container)',
                  animation: 'pulse 2s ease-in-out infinite'
                }}
              >
                <div style={{ height: '16px', backgroundColor: 'var(--color-surface-container-high)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {/* Desktop Header */}
            <div className="desktop-grid" style={{ 
              gridTemplateColumns: '150px 200px 120px 150px 200px 1fr', 
              padding: 'var(--spacing-sm) var(--spacing-md)', 
              color: 'var(--color-outline)',
              gap: 'var(--spacing-md)',
              textAlign: 'center',
              borderBottom: '2px solid var(--color-border)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span className="label-caps">Nomor Surat</span>
              <span className="label-caps">Nama PIC</span>
              <span className="label-caps">Tanggal</span>
              <span className="label-caps">Jenis Kegiatan</span>
              <span className="label-caps">Nama Kegiatan</span>
              <span className="label-caps" style={{ textAlign: 'left' }}>Detail Alat</span>
            </div>

            {usageRecords.map((record, i) => (
              <div 
                key={i} 
                className="glass-panel responsive-grid" 
                style={{ 
                  gridTemplateColumns: '150px 200px 120px 150px 200px 1fr',
                  alignItems: 'center',
                  padding: 'var(--spacing-md)', 
                  gap: 'var(--spacing-md)',
                  backgroundColor: 'var(--color-surface-container)',
                  textAlign: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-container)'}
              >
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>
                  {record.NOMOR_SURAT}
                </div>
                
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {record.NAMA_PIC}
                </div>

                <div style={{ fontSize: '13px' }}>
                  {record.TANGGAL}
                </div>

                <div style={{ fontSize: '13px' }}>
                  {record.KEGIATAN}
                </div>

                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {record.NAMA_KEGIATAN}
                </div>
                
                <div style={{ textAlign: 'left', fontSize: '13px' }} className="text-dim">
                  {record.DETAIL_ALAT}
                </div>
              </div>
            ))}
            
            {usageRecords.length === 0 && (
              <div className="glass-panel" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-outline)' }}>
                No usage records found. Generate an equipment usage form to create records.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InventoryManagement;
