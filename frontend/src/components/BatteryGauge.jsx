import React from 'react';
import { BatteryCharging, Battery, Zap, Shield, Sun, Activity } from 'lucide-react';
import { formatPercent } from '../utils/rules';

export default function BatteryGauge({ currentPoint, summary }) {
  const soc = currentPoint?.battery_soc_percent ?? summary?.current_battery_soc ?? 75.0;
  const isRenewable = currentPoint?.mode === "Renewable Storage Mode";
  const capacityKwh = summary?.battery_capacity_kwh ?? 500.0;
  const remainingKwh = (soc * capacityKwh) / 100.0;
  const dischargeKw = currentPoint?.battery_discharge_kw ?? (isRenewable ? 100.0 : 0.0);
  const solarKw = currentPoint?.solar_generation_kw ?? 0.0;

  // Determine battery color based on state
  let batteryColor = '#10b981';
  let statusText = 'Optimal Charge';
  if (soc < 20) {
    batteryColor = '#ef4444';
    statusText = 'Low Battery Warning';
  } else if (soc < 40) {
    batteryColor = '#f59e0b';
    statusText = 'Moderate Reserve';
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BatteryCharging size={20} color="var(--accent-green)" />
              Battery Energy Storage (BESS)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
              Li-ion 500 kWh Microgrid Buffer
            </p>
          </div>
          <span className="badge" style={{
            background: `${batteryColor}20`,
            color: batteryColor,
            border: `1px solid ${batteryColor}50`
          }}>
            {statusText}
          </span>
        </div>

        {/* Big Visual Battery Cell */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          margin: '20px 0'
        }}>
          {/* Battery Housing */}
          <div style={{
            width: '180px',
            height: '84px',
            border: '3px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '16px',
            padding: '6px',
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.4)',
            boxShadow: `0 0 25px ${batteryColor}30`
          }}>
            {/* Battery Terminal Pin */}
            <div style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '32px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '0 4px 4px 0'
            }} />

            {/* Liquid Fill */}
            <div style={{
              width: `${Math.min(100, Math.max(0, soc))}%`,
              height: '100%',
              borderRadius: '10px',
              background: `linear-gradient(90deg, ${batteryColor} 0%, #38bdf8 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Shimmer line */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'flow-dash 2s infinite'
              }} />
            </div>

            {/* Center SoC Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#ffffff',
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              fontFamily: 'var(--font-mono)'
            }}>
              {formatPercent(soc)}
            </div>
          </div>
        </div>

        {/* Battery Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Usable Energy</div>
            <div className="font-mono-numbers" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {remainingKwh.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>kWh</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rated Capacity</div>
            <div className="font-mono-numbers" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {capacityKwh.toFixed(0)} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>kWh</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Current Flow</div>
            <div className="font-mono-numbers" style={{ fontSize: '0.95rem', fontWeight: 700, color: isRenewable ? '#fbbf24' : '#34d399' }}>
              {isRenewable ? `-${dischargeKw.toFixed(1)} kW` : (solarKw > 10 ? `+${(solarKw * 0.4).toFixed(1)} kW` : "0.0 kW")}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Health (SOH)</div>
            <div className="font-mono-numbers" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399' }}>
              99.2% Nominal
            </div>
          </div>
        </div>
      </div>

      {/* Footer advice */}
      <div style={{
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        paddingTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Shield size={14} color="var(--accent-green)" />
        <span>BESS autonomous thermal & charge cycle protection engaged</span>
      </div>

    </div>
  );
}
