import React from 'react';
import { 
  Zap, 
  BatteryCharging, 
  AlertTriangle, 
  TrendingUp, 
  Sun, 
  Grid 
} from 'lucide-react';
import { formatKw, formatPercent } from '../utils/rules';

export default function MetricCards({ 
  currentPoint, 
  summary, 
  alertsCount 
}) {
  const demand = currentPoint?.predicted_demand_kw ?? 0;
  const isOverload = currentPoint?.is_overload ?? false;
  const isHighDemand = demand > 160;
  const mode = currentPoint?.mode ?? "Main Grid Mode";
  const isRenewable = mode === "Renewable Storage Mode";
  const soc = currentPoint?.battery_soc_percent ?? summary?.current_battery_soc ?? 75;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      
      {/* 1. Active Mode */}
      <div className={`glass-panel ${isRenewable ? 'glow-green' : 'glow-cyan'}`} style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Operational Mode
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isRenewable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isRenewable ? '#34d399' : '#38bdf8'
          }}>
            {isRenewable ? <Sun size={18} /> : <Grid size={18} />}
          </div>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isRenewable ? '#34d399' : '#38bdf8', marginBottom: '6px' }}>
          {mode}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          {currentPoint?.rule_reason || (isRenewable ? "Renewable storage discharging for peak shaving" : "Utility grid supplying baseline demand")}
        </div>
      </div>

      {/* 2. Predicted Demand */}
      <div className={`glass-panel ${isOverload ? 'glow-red' : ''}`} style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Predicted Demand ({currentPoint?.time_label || "--:--"})
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: isOverload ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isOverload ? '#ef4444' : '#60a5fa'
          }}>
            <Zap size={18} />
          </div>
        </div>
        <div className="font-mono-numbers" style={{ fontSize: '1.8rem', fontWeight: 800, color: isOverload ? '#f87171' : 'var(--text-main)', marginBottom: '4px' }}>
          {demand.toFixed(1)} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>kW</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isOverload ? (
            <span className="badge badge-critical">
              <AlertTriangle size={12} /> Critical Overload (&ge;200 kW)
            </span>
          ) : isHighDemand ? (
            <span className="badge badge-mock">
              High Load (&gt;160 kW)
            </span>
          ) : (
            <span className="badge badge-grid">
              Nominal Range (&le;160 kW)
            </span>
          )}
        </div>
      </div>

      {/* 3. Battery State of Charge (SoC) */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Battery State-of-Charge
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <BatteryCharging size={18} />
          </div>
        </div>
        <div className="font-mono-numbers" style={{ fontSize: '1.8rem', fontWeight: 800, color: soc > 20 ? '#34d399' : '#f87171', marginBottom: '4px' }}>
          {formatPercent(soc)}
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, soc))}%`,
            height: '100%',
            background: soc > 20 ? 'linear-gradient(90deg, #10b981, #34d399)' : '#ef4444',
            transition: 'width 0.4s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Cap: {((soc * 500) / 100).toFixed(0)} / 500 kWh</span>
          <span style={{ color: isRenewable ? '#fbbf24' : '#34d399' }}>
            {isRenewable ? "Discharging" : "Float / Charging"}
          </span>
        </div>
      </div>

      {/* 4. 24h Peak Demand */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            24h Peak Demand
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <TrendingUp size={18} />
          </div>
        </div>
        <div className="font-mono-numbers" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
          {summary?.peak_demand_kw ? summary.peak_demand_kw.toFixed(1) : "--"} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>kW</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <span>Peak Time: <strong style={{ color: 'var(--text-main)' }}>{summary?.peak_hour_label || "20:00"}</strong></span>
          <span>Avg: <strong style={{ color: 'var(--text-main)' }}>{summary?.average_demand_kw?.toFixed(1) || "--"} kW</strong></span>
        </div>
      </div>

    </div>
  );
}
