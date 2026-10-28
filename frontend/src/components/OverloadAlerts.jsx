import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, BellRing, ArrowUpRight } from 'lucide-react';

export default function OverloadAlerts({ alerts = [], currentPoint, onSelectHour }) {
  const currentIsOverload = currentPoint?.is_overload ?? false;
  const currentDemand = currentPoint?.predicted_demand_kw ?? 0;
  const currentExcess = Math.max(0, currentDemand - 200);

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color={alerts.length > 0 ? "var(--accent-red)" : "var(--accent-green)"} />
            Critical Overload Alerts (&ge; 200 kW)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Independent grid overload safety monitoring
          </p>
        </div>
        <span className={`badge ${alerts.length > 0 ? 'badge-critical' : 'badge-renewable'}`}>
          {alerts.length > 0 ? `${alerts.length} Hours At Risk` : "All Clear"}
        </span>
      </div>

      {/* Immediate Real-Time Banner if currently in overload */}
      {currentIsOverload && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          animation: 'pulse-red 2s infinite ease-in-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
            <BellRing size={16} /> ACTIVE CRITICAL OVERLOAD NOW ({currentPoint?.time_label})
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
            Demand is <strong>{currentDemand.toFixed(1)} kW</strong> (Exceeding the 200 kW safety threshold by <strong>+{currentExcess.toFixed(1)} kW</strong>).
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '6px' }}>
            Recommended Action: Immediately discharge BESS at peak output, activate secondary standby circuit, and shed level-3 non-critical loads.
          </div>
        </div>
      )}

      {/* Alerts Feed */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', paddingRight: '4px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Grid Stability Optimal</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No hours in the forecast exceed the 200 kW critical threshold.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((alert, idx) => {
              const isSelected = currentPoint?.hour === alert.hour;
              return (
                <div
                  key={alert.id || idx}
                  onClick={() => onSelectHour(alert.hour)}
                  style={{
                    background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Click to jump to this overload hour on the chart"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-critical" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {alert.time_label}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f87171' }}>
                        {alert.predicted_demand_kw.toFixed(1)} kW
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      +{alert.excess_kw.toFixed(1)} kW excess <ArrowUpRight size={12} />
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                    {alert.action_required || "Deploy BESS storage peak shaving and trigger demand response."}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '8px' }}>
        Rule: Any prediction &ge; 200 kW independently triggers this safety priority interrupt.
      </div>

    </div>
  );
}
