const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const app = admin.initializeApp({
    projectId: "your-test-project",  // Replace with your actual test project ID
});
const db = admin.firestore();

// Ensure Firestore Emulator is used
db.settings({ host: "localhost:8080", ssl: false });

async function testSchema() {
    try {
        console.log("🔥 Running Firestore Schema Test...");

        // ✅ Add a sample clinician
        await db.collection("clinicians").doc("clinician123").set({
            clinicianId: "clinician123",
            name: "Dr. Smith",
            email: "drsmith@example.com",
            password: "hashed_password",  // Should be hashed in real use
            patients: ["patients/patient123"]
        });
        console.log("✅ Clinician schema is valid");

        // ✅ Add a sample patient
        await db.collection("patients").doc("patient123").set({
            patientId: "patient123",
            name: "John Doe",
            dob: "1990-05-14",
            email: "johndoe@example.com",
            password: "hashed_password",
            clinicianId: "clinicians/clinician123",
            ec: "external_controllers/ec123",
            ipg: "implantable_pulse_generators/ipg123",
            sensors: ["sensor_sets/sensorSet1"],
            gaitData: []
        });
        console.log("✅ Patient schema is valid");

        // ✅ Add an external controller
        await db.collection("external_controllers").doc("ec123").set({
            ecId: "ec123",
            patientId: "patients/patient123",
            model: "EC Model 2000",
            status: "active",
            battery: 85,
            lastSync: new Date().toISOString()
        });
        console.log("✅ External Controller schema is valid");

        // ✅ Add an implantable pulse generator
        await db.collection("implantable_pulse_generators").doc("ipg123").set({
            ipgId: "ipg123",
            patientId: "patients/patient123",
            model: "IPG Model 3000",
            status: "active",
            battery: 90,
            lastSync: new Date().toISOString()
        });
        console.log("✅ Implantable Pulse Generator schema is valid");

        // ✅ Add a sensor set
        await db.collection("sensor_sets").doc("sensorSet1").set({
            sensorSetId: "sensorSet1",
            patientId: "patients/patient123",
            type: "left leg",
            sensorDetails: {
                pressure: true,
                temperature: true,
                gyroscope: true
            },
            lastSync: new Date().toISOString()
        });
        console.log("✅ Sensor Set schema is valid");

        // ✅ Add a gait data entry inside the patient's subcollection
        await db.collection("patients").doc("patient123").collection("gaitData").doc("gait123").set({
            gaitDataId: "gait123",
            sensorSetId: "sensor_sets/sensorSet1",
            timestamp: new Date().toISOString(),
            gaitMetrics: {
                velocity: 1.2,
                cadence: 120,
                strideLength: 1.5,
                pressure: 50,
                symmetry: 95
            },
            status: "uploaded"
        });
        console.log("✅ Gait Data schema is valid");

        console.log("🎉 Firestore Schema Test Passed!");

    } catch (error) {
        console.error("❌ Schema validation failed:", error);
    } finally {
        process.exit(0);  // Ensures the script exits after execution
    }
}

// Run the test automatically when this script is executed
if (require.main === module) {
    testSchema();
}
