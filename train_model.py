import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import root_mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import KFold

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
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

def main():
    train_path = os.path.join("starter_kit", "train_telemetry.csv")
    print(f"Loading training data from {train_path}...")
    df = pd.read_csv(train_path)
    print(f"Loaded {len(df)} rows.")
    
    X = extract_features(df)
    y = df["target_demand_kw"].values
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Features: {list(X.columns)}")
    
    # 5-Fold Cross Validation
    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    rmse_scores = []
    r2_scores = []
    
    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_train, y_val = y[train_idx], y[val_idx]
        
        model = GradientBoostingRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            min_samples_split=4,
            random_state=42
        )
        model.fit(X_train, y_train)
        preds = model.predict(X_val)
        
        rmse = root_mean_squared_error(y_val, preds)
        r2 = r2_score(y_val, preds)
        rmse_scores.append(rmse)
        r2_scores.append(r2)
        print(f"Fold {fold+1}: RMSE = {rmse:.2f} kW, R2 = {r2:.4f}")
        
    print(f"\nMean Cross-Validation RMSE: {np.mean(rmse_scores):.2f} kW")
    print(f"Mean R2 Score: {np.mean(r2_scores):.4f}")
    
    # Train final model on entire dataset
    print("\nTraining final model on full dataset (4,000 samples)...")
    final_model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.08,
        max_depth=5,
        min_samples_split=4,
        random_state=42
    )
    final_model.fit(X, y)
    
    # Save model in starter_kit and backend/app/models
    starter_model_path = os.path.join("starter_kit", "trained_model.joblib")
    backend_model_path = os.path.join("backend", "app", "trained_model.joblib")
    
    joblib.dump(final_model, starter_model_path)
    joblib.dump(final_model, backend_model_path)
    print(f"Saved trained model to {starter_model_path} and {backend_model_path}")
    
    # Test inference on sample_test_input.csv
    test_path = os.path.join("starter_kit", "sample_test_input.csv")
    test_df = pd.read_csv(test_path)
    X_test = extract_features(test_df)
    test_preds = final_model.predict(X_test)
    print(f"Test inference generated {len(test_preds)} predictions.")
    print(f"Min: {test_preds.min():.2f} kW, Max: {test_preds.max():.2f} kW, Mean: {test_preds.mean():.2f} kW")
    print(f"Sample first 5 predictions: {test_preds[:5]}")

if __name__ == "__main__":
    main()
