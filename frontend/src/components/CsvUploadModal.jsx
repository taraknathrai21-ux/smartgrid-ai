import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import { uploadForecastCsv, getSampleCsvUrl } from '../services/api';

export default function CsvUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage("Please upload a CSV file (.csv format).");
      setSelectedFile(null);
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const result = await uploadForecastCsv(selectedFile);
      onUploadSuccess(result);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to process CSV file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(8, 13, 26, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
              Upload Demand Forecast CSV
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: '4px' }}>
              Import custom microgrid demand points to evaluate switching rules
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: dragActive ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 0, 0, 0.25)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          <UploadCloud 
            size={44} 
            color={dragActive ? 'var(--accent-green)' : 'var(--text-dim)'} 
            style={{ margin: '0 auto 12px auto' }} 
          />

          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            {selectedFile ? selectedFile.name : "Drag & drop CSV file here, or browse"}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {selectedFile 
              ? `${(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change`
              : "Supports standard CSV formatted files with 24 hourly rows"
            }
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#f87171',
            fontSize: '0.82rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Format guide and Sample Download */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Supported Schema Columns:</span>
            <a
              href={getSampleCsvUrl()}
              download="smartgrid_sample_forecast.csv"
              style={{
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600
              }}
            >
              <Download size={13} /> Download Sample Template
            </a>
          </div>
          <code style={{ display: 'block', background: 'rgba(0,0,0,0.4)', padding: '8px', borderRadius: '6px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            hour,predicted_demand_kw,solar_generation_kw,battery_soc_percent
          </code>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isUploading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={!selectedFile || isUploading}
            style={{
              opacity: (!selectedFile || isUploading) ? 0.6 : 1,
              cursor: (!selectedFile || isUploading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isUploading ? "Processing & Evaluating..." : "Import & Run Microgrid Rules"}
          </button>
        </div>

      </div>
    </div>
  );
}
