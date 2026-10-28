from typing import List
from app.models import HourlyForecast, ForecastResponse, ForecastSummary, OverloadAlert, GridMode
from app.services.rule_engine import evaluate_switching_rules

# Curated 24-hour demand profile tailored for testing all switching rules & overload alerts
MOCK_DEMAND_PROFILE = [
    # (hour, demand_kw, solar_kw, battery_soc_percent)
    (0,  72.4,   0.0,  68.0),
    (1,  68.1,   0.0,  67.5),
    (2,  64.5,   0.0,  67.0),
    (3,  62.8,   0.0,  66.5),
    (4,  65.2,   0.0,  66.0),
    (5,  78.9,   2.5,  65.8),
    (6, 105.3,  12.0,  66.5),
    (7, 128.6,  28.4,  68.2),
    (8, 142.1,  46.1,  72.0),
    (9, 153.5,  68.5,  77.5),
    (10, 158.0, 84.2,  83.0),
    (11, 164.8, 92.0,  88.5),  # Demand > 160 kW -> Renewable Storage Mode
    (12, 175.2, 95.6,  91.0),  # Demand > 160 kW -> Renewable Storage Mode
    (13, 178.6, 91.2,  89.0),  # Demand > 160 kW -> Renewable Storage Mode
    (14, 169.4, 82.5,  86.5),  # Demand > 160 kW -> Renewable Storage Mode
    (15, 156.8, 65.0,  85.0),  # Demand <= 160 kW, before 18:00 -> Main Grid Mode
    (16, 148.2, 42.1,  83.5),  # Main Grid Mode
    (17, 155.0, 18.0,  81.0),  # Main Grid Mode
    (18, 172.5,  2.0,  75.0),  # 18:00 -> Renewable Storage Mode (Peak Hour + >160kW)
    (19, 204.8,  0.0,  64.0),  # 19:00 -> Critical Overload Alert (>=200kW) & Renewable Storage
    (20, 218.4,  0.0,  51.0),  # 20:00 -> Critical Overload Alert (>=200kW) & Renewable Storage
    (21, 186.2,  0.0,  43.0),  # 21:00 -> Renewable Storage Mode (Peak Hour + >160kW)
    (22, 162.0,  0.0,  38.5),  # 22:00 -> Renewable Storage Mode (Peak Hour + >160kW)
    (23,  94.2,  0.0,  37.0),  # 23:00 -> Main Grid Mode
]

def generate_mock_forecast() -> ForecastResponse:
    """
    Generates a full 24-hour mock forecast with microgrid switching rule evaluation.
    Clearly labelled as mock data for HackSphere 3.0 Hackathon.
    """
    data: List[HourlyForecast] = []
    alerts: List[OverloadAlert] = []

    peak_kw = 0.0
    peak_hour = 0
    min_kw = float("inf")
    total_kw = 0.0
    overload_count = 0
    renewable_count = 0
    main_grid_count = 0

    for hour, demand_kw, solar_kw, soc in MOCK_DEMAND_PROFILE:
        mode, is_overload, rule_reason, alert = evaluate_switching_rules(hour, demand_kw)
        
        if is_overload:
            overload_count += 1
            if alert:
                alerts.append(alert)
        
        if mode == GridMode.RENEWABLE_STORAGE:
            renewable_count += 1
            # In renewable storage mode, battery discharges to cover excess load or peak demand
            discharge = min(demand_kw * 0.75, 120.0)
            grid_import = max(demand_kw - discharge - solar_kw, 0.0)
        else:
            main_grid_count += 1
            discharge = 0.0
            grid_import = max(demand_kw - solar_kw, 0.0)

        severity = "CRITICAL" if is_overload else ("ELEVATED" if demand_kw > 160.0 else "NORMAL")

        point = HourlyForecast(
            hour=hour,
            time_label=f"{hour:02d}:00",
            predicted_demand_kw=round(demand_kw, 2),
            mode=mode,
            is_overload=is_overload,
            overload_severity=severity,
            rule_reason=rule_reason,
            battery_soc_percent=round(soc, 1),
            solar_generation_kw=round(solar_kw, 2),
            grid_import_kw=round(grid_import, 2),
            battery_discharge_kw=round(discharge, 2)
        )
        data.append(point)

        total_kw += demand_kw
        if demand_kw > peak_kw:
            peak_kw = demand_kw
            peak_hour = hour
        if demand_kw < min_kw:
            min_kw = demand_kw

    avg_kw = total_kw / len(MOCK_DEMAND_PROFILE)

    summary = ForecastSummary(
        peak_demand_kw=round(peak_kw, 2),
        peak_hour_label=f"{peak_hour:02d}:00",
        min_demand_kw=round(min_kw, 2),
        average_demand_kw=round(avg_kw, 2),
        overload_hours_count=overload_count,
        renewable_hours_count=renewable_count,
        main_grid_hours_count=main_grid_count,
        current_battery_soc=data[14].battery_soc_percent, # mid-day default or last hour
        battery_capacity_kwh=500.0,
        data_source="MOCK_ENGINE",
        is_mock=True,
        disclaimer="Mock prediction engine active for HackSphere 3.0 demonstration. Real-time AI Model and Zoho Catalyst endpoints are simulated placeholders pending cloud activation."
    )

    return ForecastResponse(
        summary=summary,
        data=data,
        alerts=alerts
    )
