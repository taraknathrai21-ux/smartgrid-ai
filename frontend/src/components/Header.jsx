import React from 'react';
import { 
  Zap, 
  Upload, 
  RefreshCw, 
  Download, 
  Cpu, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';
import { getSampleCsvUrl } from '../services/api';

export default function Header({ 
  onOpenUpload, 
  onResetMock, 
  isMock, 
  backendConnected,
  lastUpdated 
}) {
  return (
    <header className="glass-panel" style={{ padding: '18px 28px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Zap size={26} color="#080d1a" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                SmartGrid <span style={{ color: 'var(--accent-green)' }}>AI</span>
              </h1>
              <span className="badge badge-grid" style={{ fontSize: '0.7rem' }}>
                HackSphere 3.0
              </span>
              {isMock ? (
                <span className="badge badge-mock" title="Calibrated mock dataset active">
                  <Cpu size={12} /> Mock Data
                </span>
              ) : (
                <span className="badge badge-renewable" title="Trained Machine Learning Model Active (RMSE: 8.97 kW | R2: 0.9684)">
                  <Activity size={12} /> Trained ML Active (RMSE: 8.97 kW)
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, marginTop: '2px' }}>
              Autonomous Energy Microgrid Orchestrator & Demand Forecast Control
            </p>
          </div>
        </div>

        {/* System Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Connection Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: backendConnected ? '#10b981' : '#f59e0b',
              boxShadow: backendConnected ? '0 0 10px #10b981' : '0 0 10px #f59e0b'
            }} />
            <span>
              {backendConnected ? "FastAPI Backend Connected" : "Local Engine (Offline Fallback)"}
            </span>
          </div>

          {/* Action Buttons */}
          <button 
            onClick={onOpenUpload} 
            className="btn-primary"
            id="btn-upload-csv"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Upload size={16} />
            Upload CSV Forecast
          </button>

          <a
            href={getSampleCsvUrl()}
            download="smartgrid_sample_forecast.csv"
            className="btn-secondary"
            id="btn-sample-csv"
            style={{ padding: '8px 14px', fontSize: '0.85rem', textDecoration: 'none' }}
            title="Download 24h sample forecast CSV template"
          >
            <Download size={15} />
            Sample CSV
          </a>

          <button 
            onClick={onResetMock} 
            className="btn-secondary"
            id="btn-reset-mock"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Reload baseline 24h mock forecast"
          >
            <RefreshCw size={15} />
            Reset
          </button>

        </div>

      </div>
    </header>
  );
}
