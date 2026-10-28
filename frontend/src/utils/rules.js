// Helper constants and rule evaluation functions for frontend display and simulation

export const OVERLOAD_THRESHOLD_KW = 200.0;
export const HIGH_DEMAND_THRESHOLD_KW = 160.0;
export const PEAK_HOURS_START = 18;
export const PEAK_HOURS_END = 22;

/**
 * Checks if a given hour falls within the mandatory evening peak window [18:00 - 22:00]
 */
export function isPeakHour(hour) {
  return hour >= PEAK_HOURS_START && hour <= PEAK_HOURS_END;
}

/**
 * Evaluates the HackSphere 3.0 switching rules:
 * - If predicted demand > 160 kW OR time is between 18:00 and 22:00 inclusive -> Renewable Storage Mode
 * - Otherwise -> Main Grid Mode
 * - If predicted demand >= 200 kW -> Trigger Critical Overload Alert independently
 */
export function evaluateRules(hour, demandKw) {
  const peak = isPeakHour(hour);
  const highDemand = demandKw > HIGH_DEMAND_THRESHOLD_KW;
  const isOverload = demandKw >= OVERLOAD_THRESHOLD_KW;

  let mode = "Main Grid Mode";
  let reason = "Standard baseline demand powered via Main Utility Grid.";

  if (highDemand && peak) {
    mode = "Renewable Storage Mode";
    reason = `Evening Peak (18:00–22:00) & Demand (${demandKw.toFixed(1)} kW > ${HIGH_DEMAND_THRESHOLD_KW} kW) -> Discharging Battery Storage`;
  } else if (highDemand) {
    mode = "Renewable Storage Mode";
    reason = `Demand Threshold Exceeded (${demandKw.toFixed(1)} kW > ${HIGH_DEMAND_THRESHOLD_KW} kW) -> Discharging Battery Storage`;
  } else if (peak) {
    mode = "Renewable Storage Mode";
    reason = `Mandatory Evening Peak Window (18:00–22:00) -> Peak Shaving with Renewable Storage`;
  }

  return {
    mode,
    isOverload,
    reason,
    isPeak: peak,
    isHighDemand: highDemand,
  };
}

/**
 * Format numbers nicely
 */
export function formatKw(val) {
  return typeof val === 'number' ? `${val.toFixed(1)} kW` : '--';
}

export function formatPercent(val) {
  return typeof val === 'number' ? `${Math.round(val)}%` : '--';
}
