from firebase_config import db
import pandas as pd

def upload_gait_data(csv_file):
    """Uploads gait data from a CSV file to Firestore."""
    df = pd.read_csv(csv_file)

    # Convert DataFrame to JSON format for Firestore
    for _, row in df.iterrows():
        data = row.to_dict()
        patient_id = data.pop("patient_id")  # Use patient_id as the document ID
        db.collection("gait_data").document(patient_id).set(data)

    print("Data uploaded successfully!")

if __name__ == "__main__":
    upload_gait_data("../preprocessed_gait_data_500_patients.csv")  # Update path if needed
