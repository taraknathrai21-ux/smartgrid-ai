import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

export default function TimeSlider({ 
  selectedHour = 19, 
  onSelectHour 
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onSelectHour((prev) => (prev + 1) % 24);
      }, 1600);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, onSelectHour]);

  const presets = [
    { label: '03:00 Night Base', hour: 3, desc: '62 kW (Main Grid)' },
    { label: '12:00 Solar High', hour: 12, desc: '175 kW (>160 kW Switch)' },
    { label: '18:00 Peak Start', hour: 18, desc: '172 kW (Peak Window)' },
    { label: '20:00 Max Overload', hour: 20, desc: '218 kW (Critical Alert)' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
        
        {/* Title and Time Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Simulation Timeline Scrubber</div>
            <div className="font-mono-numbers" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Current Step: <span style={{ color: 'var(--accent-cyan)' }}>{String(selectedHour).padStart(2, '0')}:00</span>
            </div>
          </div>
        </div>

        {/* Play / Pause & Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              background: isPlaying ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
            id="btn-play-sim"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "Pause 24h Playback" : "Play 24h Simulation"}
          </button>

          <button
            onClick={() => { setIsPlaying(false); onSelectHour(0); }}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title="Reset to 00:00"
          >
            <RotateCcw size={15} />
            00:00
          </button>

        </div>

      </div>

      {/* Slider Bar */}
      <div style={{ position: 'relative', margin: '14px 0 8px 0' }}>
        <input
          type="range"
          min="0"
          max="23"
          value={selectedHour}
          onChange={(e) => onSelectHour(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            appearance: 'none',
            outline: 'none',
            background: 'linear-gradient(to right, #06b6d4 0%, #3b82f6 50%, #10b981 75%, #ef4444 85%, #06b6d4 100%)',
            cursor: 'pointer'
          }}
          id="time-range-slider"
        />

        {/* Hour tick marks */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontSize: '0.72rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>00h</span>
          <span>04h</span>
          <span>08h</span>
          <span>12h</span>
          <span>16h</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>18h (Peak)</span>
          <span style={{ color: '#f87171', fontWeight: 600 }}>20h (Overload)</span>
          <span style={{ color: '#34d399', fontWeight: 600 }}>22h</span>
          <span>23h</span>
        </div>
      </div>

      {/* Quick Jump Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Jump:</span>
        {presets.map((preset) => (
          <button
            key={preset.hour}
            onClick={() => { setIsPlaying(false); onSelectHour(preset.hour); }}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderColor: selectedHour === preset.hour ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.1)',
              background: selectedHour === preset.hour ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

    </div>
  );
}
