import React from 'react';
import { 
  Grid, 
  BatteryCharging, 
  Cpu, 
  Home, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  AlertOctagon, 
  Sparkles 
} from 'lucide-react';
import { isPeakHour } from '../utils/rules';

export default function ModeSwitchVisualizer({ currentPoint }) {
  const demand = currentPoint?.predicted_demand_kw ?? 100;
  const hour = currentPoint?.hour ?? 12;
  const mode = currentPoint?.mode ?? "Main Grid Mode";
  const isOverload = currentPoint?.is_overload ?? false;
  const isRenewable = mode === "Renewable Storage Mode";
  const peak = isPeakHour(hour);
  const highDemand = demand > 160;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Title & Active Mode Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--accent-green)" />
            Microgrid Orchestrator & Power Flow
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Live power routing based on HackSphere 3.0 switching logic
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Active Flow:</span>
          <span className={isRenewable ? "badge badge-renewable" : "badge badge-grid"} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
            {mode}
          </span>
        </div>
      </div>

      {/* Switching Rule Logic Matrix */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        fontSize: '0.8rem',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Rule 1: High Demand Condition */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: highDemand ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: highDemand ? '#34d399' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px'
          }}>
            {highDemand ? "✓" : "○"}
          </div>
          <div>
            <div style={{ color: highDemand ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
              Demand &gt; 160 kW: {highDemand ? `YES (${demand.toFixed(1)} kW)` : "NO"}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Triggers Renewable Storage</div>
          </div>
        </div>

        {/* Rule 2: Peak Hours Condition */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: peak ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: peak ? '#34d399' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px'
          }}>
            {peak ? "✓" : "○"}
          </div>
          <div>
            <div style={{ color: peak ? '#34d399' : 'var(--text-muted)', fontWeight: 600 }}>
              Time 18:00–22:00: {peak ? `YES (${currentPoint?.time_label})` : `NO (${currentPoint?.time_label})`}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Mandatory Evening Storage</div>
          </div>
        </div>

        {/* Rule 3: Critical Overload Alert */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: isOverload ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            color: isOverload ? '#f87171' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '1px'
          }}>
            {isOverload ? "!" : "○"}
          </div>
          <div>
            <div style={{ color: isOverload ? '#f87171' : 'var(--text-muted)', fontWeight: 600 }}>
              Overload &ge; 200 kW: {isOverload ? `CRITICAL (${demand.toFixed(1)} kW)` : "Safe"}
            </div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Independent Alert Trigger</div>
          </div>
        </div>
      </div>

      {/* Visual Microgrid Diagram */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        alignItems: 'center',
        padding: '20px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.06)'
      }}>

        {/* Source 1: Main Utility Grid */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: !isRenewable ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.02)',
          border: !isRenewable ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          boxShadow: !isRenewable ? '0 0 20px rgba(6, 182, 212, 0.2)' : 'none'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: !isRenewable ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: !isRenewable ? '#38bdf8' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            <Grid size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: !isRenewable ? '#38bdf8' : 'var(--text-muted)' }}>
            Main Utility Grid
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Status: <strong>{!isRenewable ? "ACTIVE FEED" : "STANDBY"}</strong>
          </div>
          <div className="font-mono-numbers" style={{ fontSize: '0.85rem', color: !isRenewable ? '#38bdf8' : 'var(--text-dim)', marginTop: '6px' }}>
            Import: {currentPoint?.grid_import_kw?.toFixed(1) || demand.toFixed(1)} kW
          </div>
        </div>

        {/* Center: Autonomous Switch Controller */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: isOverload ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)',
          border: isOverload ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: isOverload ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.2)',
            color: isOverload ? '#f87171' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            {isOverload ? <AlertOctagon size={24} /> : <Zap size={24} />}
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isOverload ? '#f87171' : 'var(--text-main)' }}>
            SmartGrid Switch Router
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Current Mode: <strong>{mode}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            {currentPoint?.rule_reason}
          </div>
        </div>

        {/* Source 2: Renewable Storage (BESS) */}
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          background: isRenewable ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
          border: isRenewable ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          boxShadow: isRenewable ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: isRenewable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isRenewable ? '#34d399' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            <BatteryCharging size={24} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isRenewable ? '#34d399' : 'var(--text-muted)' }}>
            Renewable Storage (BESS)
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Status: <strong>{isRenewable ? "ACTIVE DISCHARGE" : "RESERVE"}</strong>
          </div>
          <div className="font-mono-numbers" style={{ fontSize: '0.85rem', color: isRenewable ? '#34d399' : 'var(--text-dim)', marginTop: '6px' }}>
            Discharge: {isRenewable ? (currentPoint?.battery_discharge_kw?.toFixed(1) || "100.0") : "0.0"} kW
          </div>
        </div>

      </div>

    </div>
  );
}
