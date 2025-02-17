import pandas as pd
from sklearn.preprocessing import StandardScaler

def preprocess_gait_data(df):
    """Preprocesses gait data: handles missing values and scales features."""
    
    # 1. Handle missing values (fill with column mean)
    df.fillna(df.mean(), inplace=True)

    # 2. Normalize/scale features (so larger values don't get more importance just for being larger, ex: cadence)
    scaler = StandardScaler()
    feature_columns = ["velocity_m_s", "cadence_steps_min", "stride_length_m", "ground_reaction_force_N", "symmetry_ratio"]
    
    df[feature_columns] = scaler.fit_transform(df[feature_columns])

    return df, scaler

if __name__ == "__main__":
    # loading the collected gait data
    csv_path = "preprocessed_gait_data_500_patients.csv"
    gait_data = pd.read_csv(csv_path)

    # preprocessing all of the data
    processed_data, scaler = preprocess_gait_data(gait_data)

    # then we save the preprocessed data
    processed_data.to_csv("preprocessed_gait_data_scaled.csv", index=False)

    print("✅ Preprocessing complete! Data saved as 'preprocessed_gait_data_scaled.csv'.")
    print(processed_data.head())  # Display first few rows of the processed data
