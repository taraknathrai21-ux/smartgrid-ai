import os
import sys
import argparse
import numpy as np
import pandas as pd
import requests

QUICKML_ENDPOINT_URL = "YOUR_PUBLISHED_QUICKML_ENDPOINT_URL_HERE"

# Cache loaded model to avoid reloading on each call
_CACHED_MODEL = None

def _extract_features(df: pd.DataFrame) -> pd.DataFrame:
    dt = pd.to_datetime(df["timestamp"])
    hour = dt.dt.hour
    dayofweek = dt.dt.dayofweek
    month = dt.dt.month
    
    features = pd.DataFrame({
        "hour": hour,
        "hour_sin": np.sin(2 * np.pi * hour / 24.0),
        "hour_cos": np.cos(2 * np.pi * hour / 24.0),
        "dayofweek": dayofweek,
        "is_weekend": (dayofweek >= 5).astype(float),
        "month": month,
        "ambient_temp_c": df["ambient_temp_c"],
        "humidity_pct": df["humidity_pct"],
        "solar_irradiance_wm2": df["solar_irradiance_wm2"],
        "cooling_demand": np.maximum(0.0, df["ambient_temp_c"] - 22.0),
        "temp_humidity_idx": df["ambient_temp_c"] * (df["humidity_pct"] / 100.0)
    })
    return features

def _load_model():
    global _CACHED_MODEL
    if _CACHED_MODEL is not None:
        return _CACHED_MODEL
    
    # Check current directory and script directory
    possible_paths = [
        "trained_model.joblib",
        os.path.join(os.path.dirname(__file__), "trained_model.joblib"),
        os.path.join(os.path.dirname(__file__), "..", "backend", "app", "trained_model.joblib"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            try:
                import joblib
                _CACHED_MODEL = joblib.load(p)
                return _CACHED_MODEL
            except Exception as e:
                print(f"Notice: Failed to load model from {p}: {e}")
    return None

def predict(input_df: pd.DataFrame):
    """Parameters:
        input_df (pandas.DataFrame): DataFrame with columns
        ['timestamp', 'ambient_temp_c', 'humidity_pct', 'solar_irradiance_wm2']

    Returns:
        numpy.ndarray or list: Predicted demand (kW) for each input row.
    """
    # 1. Attempt Zoho Catalyst QuickML endpoint if configured
    if QUICKML_ENDPOINT_URL != "YOUR_PUBLISHED_QUICKML_ENDPOINT_URL_HERE":
        try:
            payload = {"data": input_df.to_dict(orient="records")}
            response = requests.post(QUICKML_ENDPOINT_URL, json=payload, timeout=10)
            response.raise_for_status()
            result = response.json()
            return np.array(result["predictions"], dtype=float)
        except Exception as e:
            print(f"Warning: QuickML endpoint call failed ({e}). Falling back to local ML model.")

    # 2. Use trained Gradient Boosting Regression model
    model = _load_model()
    if model is not None:
        try:
            X = _extract_features(input_df)
            preds = model.predict(X)
            return np.array(preds, dtype=float)
        except Exception as e:
            print(f"Warning: ML model inference failed ({e}). Falling back to heuristic baseline.")

    # 3. Fallback Heuristic Diurnal Formula
    hours = pd.to_datetime(input_df["timestamp"]).dt.hour
    base_load = 120.0 + 30.0 * np.sin(2 * np.pi * (hours - 6) / 24)
    cooling_load = np.maximum(0.0, input_df["ambient_temp_c"] - 24.0) * 8.5
    dummy_predictions = (base_load + cooling_load).values
    return np.array(dummy_predictions, dtype=float)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="HackSphere 3.0 Microgrid Demand Predictor")
    parser.add_argument("--input", default="sample_test_input.csv", help="Input CSV path")
    parser.add_argument("--output", default=None, help="Output predictions CSV path")
    args, unknown = parser.parse_known_args()

    input_path = args.input if os.path.exists(args.input) else "sample_test_input.csv"
    print(f"Testing predict.py on {input_path}...")
    sample_df = pd.read_csv(input_path)
    preds = predict(sample_df)
    print(f"Generated {len(preds)} predictions. First 5 samples:\n{preds[:5]}")

    if args.output:
        out_df = pd.DataFrame({
            "timestamp": sample_df["timestamp"],
            "target_demand_kw": np.round(preds, 2)
        })
        out_df.to_csv(args.output, index=False)
        print(f"Saved predictions to {args.output}")