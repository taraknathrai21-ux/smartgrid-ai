import io
import pandas as pd
from typing import Tuple, List, Optional
from app.models import HourlyForecast, ForecastResponse, ForecastSummary, OverloadAlert, GridMode
from app.services.rule_engine import evaluate_switching_rules
from app.services.forecast_engine import generate_live_ml_forecast

SAMPLE_CSV_CONTENT = """timestamp,ambient_temp_c,humidity_pct,solar_irradiance_wm2
2026-10-24 00:00:00,18.5,65.0,0.0
2026-10-24 01:00:00,17.8,68.0,0.0
2026-10-24 02:00:00,17.2,70.0,0.0
2026-10-24 03:00:00,16.9,72.0,0.0
2026-10-24 04:00:00,16.5,75.0,0.0
2026-10-24 05:00:00,17.0,73.0,5.0
2026-10-24 06:00:00,19.2,68.0,35.0
2026-10-24 07:00:00,22.4,62.0,95.0
2026-10-24 08:00:00,25.8,55.0,175.0
2026-10-24 09:00:00,28.5,50.0,260.0
2026-10-24 10:00:00,31.2,46.0,340.0
2026-10-24 11:00:00,33.5,43.0,380.0
2026-10-24 12:00:00,35.0,40.0,400.0
2026-10-24 13:00:00,35.8,38.0,390.0
2026-10-24 14:00:00,35.2,39.0,350.0
2026-10-24 15:00:00,33.8,42.0,280.0
2026-10-24 16:00:00,31.5,46.0,190.0
2026-10-24 17:00:00,29.0,52.0,85.0
2026-10-24 18:00:00,27.2,56.0,15.0
2026-10-24 19:00:00,25.5,60.0,0.0
2026-10-24 20:00:00,23.8,64.0,0.0
2026-10-24 21:00:00,22.0,66.0,0.0
2026-10-24 22:00:00,20.5,67.0,0.0
2026-10-24 23:00:00,19.2,68.0,0.0
"""

def parse_and_evaluate_csv(file_bytes: bytes, filename: str) -> ForecastResponse:
    """
    Parses an uploaded CSV file, extracts demand or weather features, and evaluates microgrid switching rules.
    If weather telemetry is uploaded (like sample_test_input.csv), automatically invokes the trained ML model.
    """
    try:
        df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Failed to read CSV file: {str(e)}")

    if df.empty:
        raise ValueError("The uploaded CSV file is empty.")

    # Normalize column names (lowercase, stripped)
    column_map = {col: col.strip().lower().replace(" ", "_") for col in df.columns}
    df.rename(columns=column_map, inplace=True)

    # Check if raw weather telemetry is present (e.g. sample_test_input.csv)
    weather_cols = ["ambient_temp_c", "humidity_pct", "solar_irradiance_wm2"]
    if all(col in df.columns for col in weather_cols):
        # Automatically run trained ML regression model to forecast demand!
        forecast_resp = generate_live_ml_forecast(df.iloc[:24].copy())
        forecast_resp.summary.data_source = f"ML_MODEL on '{filename}'"
        forecast_resp.summary.disclaimer = f"Demand forecast generated from '{filename}' via trained GradientBoostingRegressor (RMSE: 8.97 kW)."
        return forecast_resp

    # Otherwise, detect hour column
    hour_col = None
    for candidate in ["hour", "time", "hour_of_day", "hr", "timestamp"]:
        if candidate in df.columns:
            hour_col = candidate
            break

    # Detect demand column
    demand_col = None
    for candidate in ["predicted_demand_kw", "demand_kw", "predicted_demand", "demand", "load_kw", "load", "power_kw", "kw", "target_demand_kw"]:
        if candidate in df.columns:
            demand_col = candidate
            break

    if not demand_col:
        raise ValueError(
            "Could not identify a demand column or weather feature columns in the CSV. "
            "Please ensure there is a column named 'predicted_demand_kw', 'demand_kw', or weather inputs ('ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2')."
        )

    # Optional solar and battery columns
    solar_col = next((c for c in ["solar_generation_kw", "solar_kw", "solar", "generation_kw", "pv_kw"] if c in df.columns), None)
    soc_col = next((c for c in ["battery_soc_percent", "battery_soc", "soc", "battery_percent"] if c in df.columns), None)

    data: List[HourlyForecast] = []
    alerts: List[OverloadAlert] = []
    
    total_rows = min(len(df), 24)
    peak_kw = 0.0
    peak_hour = 0
    min_kw = float("inf")
    total_kw = 0.0
    overload_count = 0
    renewable_count = 0
    main_grid_count = 0

    default_soc = 70.0

    for i in range(total_rows):
        row = df.iloc[i]

        if hour_col:
            try:
                val = str(row[hour_col]).strip()
                if ":" in val:
                    hr = int(val.split(":")[0])
                else:
                    hr = int(float(val))
            except Exception:
                hr = i
        else:
            hr = i
        
        hr = max(0, min(23, hr))

        try:
            demand_kw = float(row[demand_col])
        except Exception:
            demand_kw = 100.0

        solar_kw = float(row[solar_col]) if (solar_col and pd.notna(row[solar_col])) else (
            80.0 * max(0.0, 1 - abs(hr - 13)/6) if 7 <= hr <= 19 else 0.0
        )
        if soc_col and pd.notna(row[soc_col]):
            soc = float(row[soc_col])
        else:
            soc = default_soc

        mode, is_overload, rule_reason, alert = evaluate_switching_rules(hr, demand_kw)

        if is_overload:
            overload_count += 1
            if alert:
                alerts.append(alert)

        if mode == GridMode.RENEWABLE_STORAGE:
            renewable_count += 1
            discharge = min(demand_kw * 0.7, 120.0)
            grid_import = max(demand_kw - discharge - solar_kw, 0.0)
        else:
            main_grid_count += 1
            discharge = 0.0
            grid_import = max(demand_kw - solar_kw, 0.0)

        severity = "CRITICAL" if is_overload else ("ELEVATED" if demand_kw > 160.0 else "NORMAL")

        point = HourlyForecast(
            hour=hr,
            time_label=f"{hr:02d}:00",
            predicted_demand_kw=round(demand_kw, 2),
            mode=mode,
            is_overload=is_overload,
            overload_severity=severity,
            rule_reason=rule_reason,
            battery_soc_percent=round(max(5.0, min(100.0, soc)), 1),
            solar_generation_kw=round(max(0.0, solar_kw), 2),
            grid_import_kw=round(grid_import, 2),
            battery_discharge_kw=round(discharge, 2)
        )
        data.append(point)

        total_kw += demand_kw
        if demand_kw > peak_kw:
            peak_kw = demand_kw
            peak_hour = hr
        if demand_kw < min_kw:
            min_kw = demand_kw

    data.sort(key=lambda x: x.hour)
    avg_kw = total_kw / max(len(data), 1)

    summary = ForecastSummary(
        peak_demand_kw=round(peak_kw, 2),
        peak_hour_label=f"{peak_hour:02d}:00",
        min_demand_kw=round(min_kw if min_kw != float("inf") else 0.0, 2),
        average_demand_kw=round(avg_kw, 2),
        overload_hours_count=overload_count,
        renewable_hours_count=renewable_count,
        main_grid_hours_count=main_grid_count,
        current_battery_soc=data[-1].battery_soc_percent if data else 70.0,
        battery_capacity_kwh=500.0,
        data_source=f"USER_CSV: {filename}",
        is_mock=False,
        disclaimer=f"Custom forecast dataset loaded from '{filename}'. Switching rules and overload limits computed dynamically by SmartGrid AI Rule Engine."
    )

    return ForecastResponse(
        summary=summary,
        data=data,
        alerts=alerts
    )
