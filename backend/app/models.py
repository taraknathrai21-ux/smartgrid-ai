from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class GridMode(str, Enum):
    MAIN_GRID = "Main Grid Mode"
    RENEWABLE_STORAGE = "Renewable Storage Mode"

class HourlyForecast(BaseModel):
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    time_label: str = Field(..., description="Formatted hour string, e.g., '14:00'")
    predicted_demand_kw: float = Field(..., description="Predicted electricity demand in kW")
    mode: GridMode = Field(..., description="Active operational mode according to microgrid switching rules")
    is_overload: bool = Field(..., description="True if predicted demand is at least 200 kW")
    overload_severity: Optional[str] = Field("NORMAL", description="Alert severity: NORMAL, ELEVATED, CRITICAL")
    rule_reason: str = Field(..., description="Explanation of why this mode was chosen")
    battery_soc_percent: float = Field(..., ge=0, le=100, description="Battery State-of-Charge in percentage")
    solar_generation_kw: float = Field(..., ge=0, description="Estimated renewable solar generation in kW")
    grid_import_kw: float = Field(..., ge=0, description="Power drawn from main utility grid in kW")
    battery_discharge_kw: float = Field(..., ge=0, description="Power drawn from battery energy storage in kW")

class OverloadAlert(BaseModel):
    id: str
    hour: int
    time_label: str
    predicted_demand_kw: float
    threshold_kw: float = 200.0
    excess_kw: float
    severity: str = "CRITICAL"
    timestamp: str
    message: str
    action_required: str

class ForecastSummary(BaseModel):
    peak_demand_kw: float
    peak_hour_label: str
    min_demand_kw: float
    average_demand_kw: float
    overload_hours_count: int
    renewable_hours_count: int
    main_grid_hours_count: int
    current_battery_soc: float
    battery_capacity_kwh: float = 500.0
    data_source: str = "MOCK_ENGINE"
    is_mock: bool = True
    disclaimer: str = "Mock prediction engine generated for HackSphere 3.0 hackathon demonstration. AI Model and Zoho Catalyst endpoints are mocked/pending connection."

class ForecastResponse(BaseModel):
    summary: ForecastSummary
    data: List[HourlyForecast]
    alerts: List[OverloadAlert]

class RuleEvaluationRequest(BaseModel):
    hour: int = Field(..., ge=0, le=23)
    predicted_demand_kw: float = Field(..., ge=0)
    current_battery_soc: Optional[float] = 75.0

class RuleEvaluationResponse(BaseModel):
    hour: int
    time_label: str
    predicted_demand_kw: float
    mode: GridMode
    is_overload: bool
    rule_reason: str
    alert: Optional[OverloadAlert] = None
    suggested_battery_soc: float
