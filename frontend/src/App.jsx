import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArchitectureDisclaimer from './components/ArchitectureDisclaimer';
import MetricCards from './components/MetricCards';
import ForecastChart from './components/ForecastChart';
import ModeSwitchVisualizer from './components/ModeSwitchVisualizer';
import BatteryGauge from './components/BatteryGauge';
import OverloadAlerts from './components/OverloadAlerts';
import TimeSlider from './components/TimeSlider';
import CsvUploadModal from './components/CsvUploadModal';
import { fetchForecast } from './services/api';

export default function App() {
  const [forecast, setForecast] = useState(null);
  const [selectedHour, setSelectedHour] = useState(19); // Default to 19:00 (Evening peak + Critical Overload demo)
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial 24h forecast (mock data engine from backend with client fallback)
  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await fetchForecast();
      setForecast(data);
    } catch (err) {
      console.error("Failed to fetch forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const handleUploadSuccess = (uploadedData) => {
    setForecast(uploadedData);
    if (uploadedData?.data && uploadedData.data.length > 0) {
      setSelectedHour(uploadedData.data[0].hour);
    }
  };

  const handleResetMock = () => {
    loadForecast();
  };

  // Find the selected hour's data point
  const currentPoint = forecast?.data?.find((p) => p.hour === selectedHour) || forecast?.data?.[0] || {
    hour: 19,
    time_label: "19:00",
    predicted_demand_kw: 204.8,
    mode: "Renewable Storage Mode",
    is_overload: true,
    rule_reason: "Peak Hours & Demand exceeds 160 kW -> Discharging Renewable Storage",
    battery_soc_percent: 64.0,
    solar_generation_kw: 0.0,
    grid_import_kw: 0.0,
    battery_discharge_kw: 100.0,
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px 48px 20px' }}>
      
      {/* 1. Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetMock={handleResetMock}
        isMock={forecast?.summary?.is_mock ?? true}
        backendConnected={forecast?.backendConnected ?? false}
      />

      {/* 2. HackSphere 3.0 Architecture Disclaimer */}
      <ArchitectureDisclaimer summary={forecast?.summary} />

      {/* 3. Metric KPI Cards */}
      <MetricCards
        currentPoint={currentPoint}
        summary={forecast?.summary}
        alertsCount={forecast?.alerts?.length || 0}
      />

      {/* 4. 24-Hour Forecast Demand Curve with Overload & Switch Thresholds */}
      <ForecastChart
        data={forecast?.data || []}
        selectedHour={selectedHour}
        onSelectHour={(hr) => setSelectedHour(hr)}
      />

      {/* 5. 24-Hour Timeline Scrubber & Simulation Playback */}
      <TimeSlider
        selectedHour={selectedHour}
        onSelectHour={(hr) => setSelectedHour(hr)}
      />

      {/* 6. Lower Dashboard Section: Microgrid Orchestrator & Storage Safety */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Left Column: Microgrid Topology & Switching Router */}
        <div>
          <ModeSwitchVisualizer currentPoint={currentPoint} />
        </div>

        {/* Right Column: Battery State-of-Charge & Overload Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <BatteryGauge currentPoint={currentPoint} summary={forecast?.summary} />
          <OverloadAlerts
            alerts={forecast?.alerts || []}
            currentPoint={currentPoint}
            onSelectHour={(hr) => setSelectedHour(hr)}
          />
        </div>
      </div>

      {/* Footer info */}
      <footer style={{
        textAlign: 'center',
        padding: '24px 0 10px 0',
        fontSize: '0.8rem',
        color: 'var(--text-dim)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        SmartGrid AI &bull; Built for HackSphere 3.0 Smart Energy Microgrid Challenge &bull; React + Vite &bull; FastAPI Backend
      </footer>

      {/* CSV Upload Modal */}
      <CsvUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

    </div>
  );
}
