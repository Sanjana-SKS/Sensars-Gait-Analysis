import admin from "firebase-admin";
import fs from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Fixes `__dirname` not being available in ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
    fs.readFileSync(resolve(__dirname, "serviceAccountKey.json"), "utf8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "sensars-gaitanalysistol"
});

const db = admin.firestore();

// Load JSON file
const data = JSON.parse(fs.readFileSync(resolve(__dirname, "data.json"), "utf8"));

const uploadData = async () => {
    try {
        // Upload Clinicians
        for (const [clinicianId, clinicianData] of Object.entries(data.clinicians)) {
            await db.collection("clinicians").doc(clinicianId).set(clinicianData);
        }

        // Upload Patients
        for (const [patientId, patientData] of Object.entries(data.patients)) {
            await db.collection("patients").doc(patientId).set(patientData);
        }

        // Upload External Controllers
        for (const [ecId, ecData] of Object.entries(data.external_controllers)) {
            await db.collection("external_controllers").doc(ecId).set(ecData);
        }

        // Upload Implantable Pulse Generators
        for (const [ipgId, ipgData] of Object.entries(data.implantable_pulse_generators)) {
            await db.collection("implantable_pulse_generators").doc(ipgId).set(ipgData);
        }

        // Upload Sensor Sets
        for (const [sensorId, sensorData] of Object.entries(data.sensor_sets)) {
            await db.collection("sensor_sets").doc(sensorId).set(sensorData);
        }

        console.log("🔥 Firestore data uploaded successfully!");
    } catch (error) {
        console.error("❌ Error uploading data:", error);
    }
};

// Run the upload function by doing "node uploadfirestore.js"
uploadData();
