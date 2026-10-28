const API_BASE = "http://localhost:8000/api";

// Fallback client-side mock data generator in case backend is starting or offline
import { evaluateRules } from "../utils/rules";

const CLIENT_MOCK_PROFILE = [
  { hour: 0, demand: 72.4, solar: 0.0, soc: 68.0 },
  { hour: 1, demand: 68.1, solar: 0.0, soc: 67.5 },
  { hour: 2, demand: 64.5, solar: 0.0, soc: 67.0 },
  { hour: 3, demand: 62.8, solar: 0.0, soc: 66.5 },
  { hour: 4, demand: 65.2, solar: 0.0, soc: 66.0 },
  { hour: 5, demand: 78.9, solar: 2.5, soc: 65.8 },
  { hour: 6, demand: 105.3, solar: 12.0, soc: 66.5 },
  { hour: 7, demand: 128.6, solar: 28.4, soc: 68.2 },
  { hour: 8, demand: 142.1, solar: 46.1, soc: 72.0 },
  { hour: 9, demand: 153.5, solar: 68.5, soc: 77.5 },
  { hour: 10, demand: 158.0, solar: 84.2, soc: 83.0 },
  { hour: 11, demand: 164.8, solar: 92.0, soc: 88.5 },
  { hour: 12, demand: 175.2, solar: 95.6, soc: 91.0 },
  { hour: 13, demand: 178.6, solar: 91.2, soc: 89.0 },
  { hour: 14, demand: 169.4, solar: 82.5, soc: 86.5 },
  { hour: 15, demand: 156.8, solar: 65.0, soc: 85.0 },
  { hour: 16, demand: 148.2, solar: 42.1, soc: 83.5 },
  { hour: 17, demand: 155.0, solar: 18.0, soc: 81.0 },
  { hour: 18, demand: 172.5, solar: 2.0, soc: 75.0 },
  { hour: 19, demand: 204.8, solar: 0.0, soc: 64.0 },
  { hour: 20, demand: 218.4, solar: 0.0, soc: 51.0 },
  { hour: 21, demand: 186.2, solar: 0.0, soc: 43.0 },
  { hour: 22, demand: 162.0, solar: 0.0, soc: 38.5 },
  { hour: 23, demand: 94.2, solar: 0.0, soc: 37.0 },
];

function generateClientMock() {
  const alerts = [];
  let peakKw = 0;
  let peakHour = 0;
  let minKw = Infinity;
  let sumKw = 0;
  let overloadCount = 0;
  let renewableCount = 0;
  let mainGridCount = 0;

  const data = CLIENT_MOCK_PROFILE.map((item) => {
    const { mode, isOverload, reason } = evaluateRules(item.hour, item.demand);
    if (isOverload) {
      overloadCount++;
      alerts.push({
        id: `alert-hr${item.hour}`,
        hour: item.hour,
        time_label: `${String(item.hour).padStart(2, '0')}:00`,
        predicted_demand_kw: item.demand,
        threshold_kw: 200.0,
        excess_kw: Math.round((item.demand - 200.0) * 10) / 10,
        severity: "CRITICAL",
        timestamp: new Date().toLocaleTimeString(),
        message: `CRITICAL OVERLOAD ALERT: Predicted demand of ${item.demand.toFixed(1)} kW exceeds 200 kW limit at ${String(item.hour).padStart(2, '0')}:00.`,
        action_required: "Engage backup battery storage and initiate automatic peak load shedding.",
      });
    }

    if (mode === "Renewable Storage Mode") {
      renewableCount++;
    } else {
      mainGridCount++;
    }

    if (item.demand > peakKw) {
      peakKw = item.demand;
      peakHour = item.hour;
    }
    if (item.demand < minKw) {
      minKw = item.demand;
    }
    sumKw += item.demand;

    return {
      hour: item.hour,
      time_label: `${String(item.hour).padStart(2, '0')}:00`,
      predicted_demand_kw: item.demand,
      mode: mode,
      is_overload: isOverload,
      overload_severity: isOverload ? "CRITICAL" : (item.demand > 160 ? "ELEVATED" : "NORMAL"),
      rule_reason: reason,
      battery_soc_percent: item.soc,
      solar_generation_kw: item.solar,
      grid_import_kw: mode === "Renewable Storage Mode" ? Math.max(0, item.demand - 100 - item.solar) : item.demand,
      battery_discharge_kw: mode === "Renewable Storage Mode" ? Math.min(item.demand, 100) : 0,
    };
  });

  return {
    summary: {
      peak_demand_kw: peakKw,
      peak_hour_label: `${String(peakHour).padStart(2, '0')}:00`,
      min_demand_kw: minKw,
      average_demand_kw: Math.round((sumKw / 24) * 10) / 10,
      overload_hours_count: overloadCount,
      renewable_hours_count: renewableCount,
      main_grid_hours_count: mainGridCount,
      current_battery_soc: 86.5,
      battery_capacity_kwh: 500.0,
      data_source: "MOCK_ENGINE",
      is_mock: true,
      disclaimer: "Mock prediction engine active for HackSphere 3.0 demonstration. AI Model and Zoho Catalyst endpoints are mocked/pending connection.",
    },
    data,
    alerts,
  };
}

/**
 * Fetch 24-hour mock forecast from backend, falling back to local mock if server is offline
 */
export async function fetchForecast() {
  try {
    const res = await fetch(`${API_BASE}/forecast/mock`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { ...data, backendConnected: true };
  } catch (err) {
    console.warn("Backend unavailable, using local mock data engine:", err.message);
    const mockData = generateClientMock();
    return { ...mockData, backendConnected: false };
  }
}

/**
 * Evaluate single data point via backend or local rule engine
 */
export async function evaluatePoint(hour, predictedDemandKw, batterySoc = 75.0) {
  try {
    const res = await fetch(`${API_BASE}/forecast/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hour,
        predicted_demand_kw: predictedDemandKw,
        current_battery_soc: batterySoc,
      }),
    });
    if (!res.ok) throw new Error("Evaluation failed");
    return await res.json();
  } catch {
    const { mode, isOverload, reason } = evaluateRules(hour, predictedDemandKw);
    return {
      hour,
      time_label: `${String(hour).padStart(2, '0')}:00`,
      predicted_demand_kw: predictedDemandKw,
      mode,
      is_overload: isOverload,
      rule_reason: reason,
      alert: isOverload ? {
        id: `alert-hr${hour}`,
        hour,
        time_label: `${String(hour).padStart(2, '0')}:00`,
        predicted_demand_kw: predictedDemandKw,
        threshold_kw: 200.0,
        excess_kw: predictedDemandKw - 200.0,
        severity: "CRITICAL",
        message: `CRITICAL OVERLOAD: ${predictedDemandKw} kW exceeds 200 kW threshold`,
      } : null,
      suggested_battery_soc: mode === "Renewable Storage Mode" ? Math.max(10, batterySoc - 4.5) : Math.min(98, batterySoc + 2.0),
    };
  }
}

/**
 * Upload CSV file to backend
 */
export async function uploadForecastCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/csv`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Failed to upload CSV" }));
    throw new Error(errorData.detail || "Failed to process CSV file");
  }

  const data = await res.json();
  return { ...data, backendConnected: true };
}

/**
 * Download sample CSV template URL
 */
export function getSampleCsvUrl() {
  return `${API_BASE}/upload/template`;
}
