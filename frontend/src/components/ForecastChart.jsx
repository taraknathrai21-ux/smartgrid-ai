import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { AlertTriangle, Clock, Zap, Sun } from 'lucide-react';

export default function ForecastChart({ 
  data = [], 
  selectedHour = 19, 
  onSelectHour 
}) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      const isOverload = point.predicted_demand_kw >= 200;
      const isRenewable = point.mode === "Renewable Storage Mode";

      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: isOverload ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '14px 18px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          minWidth: '220px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
              Time: {point.time_label}
            </span>
            <span className={isOverload ? "badge badge-critical" : (isRenewable ? "badge badge-renewable" : "badge badge-grid")}>
              {point.mode}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Predicted Demand:</span>
              <strong style={{ color: isOverload ? '#f87171' : '#38bdf8' }}>
                {point.predicted_demand_kw.toFixed(1)} kW
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Battery SoC:</span>
              <strong style={{ color: '#34d399' }}>
                {point.battery_soc_percent.toFixed(1)}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Solar Gen:</span>
              <strong style={{ color: '#fbbf24' }}>
                {point.solar_generation_kw.toFixed(1)} kW
              </strong>
            </div>
          </div>

          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            lineHeight: '1.3'
          }}>
            {point.rule_reason}
          </div>

          {isOverload && (
            <div style={{
              marginTop: '6px',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertTriangle size={13} /> OVERLOAD: Exceeds 200 kW safety threshold!
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header and Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-cyan)" />
            24-Hour Electricity Demand Forecast
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, marginTop: '2px' }}>
            Click any hour point to inspect microgrid switching decisions & battery state
          </p>
        </div>

        {/* Visual Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(56, 189, 248, 0.6)' }} />
            <span>Demand Curve (kW)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '2px', background: '#f59e0b', borderTop: '2px dashed #f59e0b' }} />
            <span>Switch Threshold (160 kW)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '16px', height: '2px', background: '#ef4444', borderTop: '2px dashed #ef4444' }} />
            <span>Critical Overload (200 kW)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }} />
            <span>Peak Window (18:00 - 22:00)</span>
          </div>

        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height: '340px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload.length) {
                onSelectHour(e.activePayload[0].payload.hour);
              }
            }}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              {/* Gradient for demand area */}
              <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1e1b4b" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient for solar curve */}
              <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
            
            <XAxis 
              dataKey="time_label" 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            
            <YAxis 
              domain={[40, 240]} 
              stroke="#64748b" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit=" kW"
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            
            <Tooltip content={<CustomTooltip />} />

            {/* Peak Window Area: 18:00 to 22:00 */}
            <ReferenceArea 
              x1="18:00" 
              x2="22:00" 
              fill="#10b981" 
              fillOpacity={0.07}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeOpacity={0.3}
              label={{ value: 'PEAK WINDOW (18–22h)', fill: '#34d399', fontSize: 10, position: 'insideTop' }}
            />

            {/* 160 kW Switching threshold */}
            <ReferenceLine 
              y={160} 
              stroke="#f59e0b" 
              strokeDasharray="5 5" 
              strokeWidth={1.5}
              label={{ value: '160 kW Mode Switch Limit', fill: '#fbbf24', fontSize: 11, position: 'insideTopLeft' }}
            />

            {/* 200 kW Critical overload threshold */}
            <ReferenceLine 
              y={200} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              strokeWidth={2}
              label={{ value: '200 kW Critical Overload Threshold', fill: '#f87171', fontSize: 11, position: 'insideTopLeft' }}
            />

            {/* Solar Generation Area */}
            <Area
              type="monotone"
              dataKey="solar_generation_kw"
              fill="url(#solarGradient)"
              stroke="#f59e0b"
              strokeWidth={1}
              strokeDasharray="2 2"
              name="Solar Gen (kW)"
            />

            {/* Demand Area & Line */}
            <Area
              type="monotone"
              dataKey="predicted_demand_kw"
              fill="url(#demandGradient)"
              stroke="#38bdf8"
              strokeWidth={2.5}
              name="Predicted Demand (kW)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isSelected = payload.hour === selectedHour;
                const isOverload = payload.predicted_demand_kw >= 200;
                const isRenewable = payload.mode === "Renewable Storage Mode";

                if (isSelected) {
                  return (
                    <circle
                      key={`dot-${payload.hour}`}
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill={isOverload ? "#ef4444" : "#10b981"}
                      stroke="#ffffff"
                      strokeWidth={2.5}
                      style={{ filter: `drop-shadow(0 0 8px ${isOverload ? '#ef4444' : '#10b981'})` }}
                    />
                  );
                }

                if (isOverload) {
                  return (
                    <circle
                      key={`dot-${payload.hour}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                  );
                }

                if (isRenewable) {
                  return (
                    <circle
                      key={`dot-${payload.hour}`}
                      cx={cx}
                      cy={cy}
                      r={3.5}
                      fill="#34d399"
                    />
                  );
                }

                return (
                  <circle
                    key={`dot-${payload.hour}`}
                    cx={cx}
                    cy={cy}
                    r={2.5}
                    fill="#38bdf8"
                    opacity={0.6}
                  />
                );
              }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
        <span>&bull; Currently inspecting: <strong>{String(selectedHour).padStart(2, '0')}:00</strong></span>
        <span>Green dots: Renewable Storage Mode | Red dots: Overload Alert (&ge; 200 kW)</span>
      </div>

    </div>
  );
}
