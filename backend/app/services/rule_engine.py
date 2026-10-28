from typing import Tuple, Optional
from datetime import datetime
from app.models import GridMode, OverloadAlert

OVERLOAD_THRESHOLD_KW = 200.0
HIGH_DEMAND_THRESHOLD_KW = 160.0
PEAK_HOURS_START = 18
PEAK_HOURS_END = 22

def evaluate_switching_rules(
    hour: int, 
    predicted_demand_kw: float
) -> Tuple[GridMode, bool, str, Optional[OverloadAlert]]:
    """
    Evaluates microgrid switching rules based on HackSphere 3.0 problem statement:
    
    1. If predicted demand is greater than 160 kW OR the time is between 18:00 and 22:00 inclusive:
       -> Use Renewable Storage Mode.
    2. Otherwise:
       -> Use Main Grid Mode.
    3. If predicted demand is at least 200 kW:
       -> Trigger a Critical Overload Alert independently.
    """
    time_label = f"{hour:02d}:00"
    is_peak_hours = (PEAK_HOURS_START <= hour <= PEAK_HOURS_END)
    is_high_demand = (predicted_demand_kw > HIGH_DEMAND_THRESHOLD_KW)
    
    # Mode selection
    if is_high_demand and is_peak_hours:
        mode = GridMode.RENEWABLE_STORAGE
        rule_reason = f"Peak Hours ({PEAK_HOURS_START}:00–{PEAK_HOURS_END}:00) & High Demand ({predicted_demand_kw:.1f} kW > {HIGH_DEMAND_THRESHOLD_KW} kW) -> Discharging Renewable Storage"
    elif is_high_demand:
        mode = GridMode.RENEWABLE_STORAGE
        rule_reason = f"High Demand Threshold Exceeded ({predicted_demand_kw:.1f} kW > {HIGH_DEMAND_THRESHOLD_KW} kW) -> Discharging Renewable Storage"
    elif is_peak_hours:
        mode = GridMode.RENEWABLE_STORAGE
        rule_reason = f"Mandatory Evening Peak Window ({PEAK_HOURS_START}:00–{PEAK_HOURS_END}:00) -> Peak Shaving with Renewable Storage"
    else:
        mode = GridMode.MAIN_GRID
        rule_reason = f"Standard Off-Peak Operation ({predicted_demand_kw:.1f} kW <= {HIGH_DEMAND_THRESHOLD_KW} kW) -> Powered via Main Utility Grid"

    # Independent Overload Check
    is_overload = (predicted_demand_kw >= OVERLOAD_THRESHOLD_KW)
    alert: Optional[OverloadAlert] = None
    
    if is_overload:
        excess = predicted_demand_kw - OVERLOAD_THRESHOLD_KW
        alert = OverloadAlert(
            id=f"alert-hr{hour:02d}",
            hour=hour,
            time_label=time_label,
            predicted_demand_kw=round(predicted_demand_kw, 2),
            threshold_kw=OVERLOAD_THRESHOLD_KW,
            excess_kw=round(excess, 2),
            severity="CRITICAL",
            timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            message=f"CRITICAL OVERLOAD ALERT: Predicted demand of {predicted_demand_kw:.1f} kW exceeds safety limit ({OVERLOAD_THRESHOLD_KW} kW) by {excess:.1f} kW at {time_label}.",
            action_required="Engage secondary battery backup, initiate demand-response shedding for non-critical loads, and notify microgrid operator."
        )

    return mode, is_overload, rule_reason, alert
