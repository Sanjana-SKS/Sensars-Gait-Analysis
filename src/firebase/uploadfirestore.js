import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(fs.readFileSync("./src/firebase/serviceAccountKey.json", "utf8"));


// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read JSON file
const rawData = fs.readFileSync("./src/firebase/data.json", "utf-8");
const data = JSON.parse(rawData);

// Function to upload data
const uploadData = async () => {
    try {
        console.log("📤 Uploading data to Firestore...");

        // Upload clinicians
        const cliniciansRef = db.collection("clinicians");
        for (const [id, clinician] of Object.entries(data.clinicians || {})) {
            await cliniciansRef.doc(id).set(clinician);
        }

        // Upload patients
        const patientsRef = db.collection("patients");
        for (const [id, patient] of Object.entries(data.patients || {})) {
            await patientsRef.doc(id).set(patient);

            // Upload gaitData subcollection
            if (patient.gaitData) {
                const gaitDataRef = db.collection("patients").doc(id).collection("gaitData");
                for (const [gaitId, gaitEntry] of Object.entries(patient.gaitData)) {
                    await gaitDataRef.doc(gaitId).set(gaitEntry);
                }
            }
        }

        // Upload external controllers
        const ecRef = db.collection("external_controllers");
        for (const [id, ec] of Object.entries(data.external_controllers || {})) {
            await ecRef.doc(id).set(ec);
        }

        // Upload implantable pulse generators
        const ipgRef = db.collection("implantable_pulse_generators");
        for (const [id, ipg] of Object.entries(data.implantable_pulse_generators || {})) {
            await ipgRef.doc(id).set(ipg);
        }

        // Upload sensor sets
        const sensorsRef = db.collection("sensor_sets");
        for (const [id, sensor] of Object.entries(data.sensor_sets || {})) {
            await sensorsRef.doc(id).set(sensor);
        }

        console.log("✅ Data successfully uploaded to Firestore!");
    } catch (error) {
        console.error("❌ Error uploading data:", error);
    }
};

// Run the function
uploadData();
