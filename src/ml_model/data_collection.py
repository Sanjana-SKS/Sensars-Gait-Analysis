import pandas as pd

def retrieve_gait_data(csv_file):
    """Retrieves gait data from a local CSV file (simulating a database)."""
    df = pd.read_csv(csv_file)
    return df

if __name__ == "__main__":
    csv_path = "preprocessed_gait_data_500_patients.csv"
    gait_data = retrieve_gait_data(csv_path)

    # Print the first few rows to verify
    print("First 5 rows of the retrieved gait data:")
    print(gait_data.head())
