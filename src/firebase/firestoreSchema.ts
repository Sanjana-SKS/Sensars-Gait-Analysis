import * as admin from "firebase-admin";

// Load Firebase Service Account Key
import * as serviceAccount from "./firebase-admin-key.json"; // Update path

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

// Define TypeScript Interfaces for Firestore Schema
interface Clinician {
  name: string;
  email: string;
  password: string;
  patients: string[]; // Array of patient IDs
}

interface Patient {
  name: string;
  dob: string;
  email: string;
  password: string;
  clinicianId: string;
  ec: string;
  ipg: string;
  sensors: string[];
}

interface ExternalController {
  patientId: string;
  model: string;
  status: string;
  battery: number;
  lastSync: FirebaseFirestore.Timestamp;
}

interface ImplantablePulseGenerator {
  patientId: string;
  model: string;
  status: string;
  battery: number;
  lastSync: FirebaseFirestore.Timestamp;
}

interface SensorSet {
  patientId: string;
  type: string;
  sensorDetails: Record<string, boolean>; // Example: { pressure: true, temperature: true }
  lastSync: FirebaseFirestore.Timestamp;
}

interface GaitData {
  sensorSetId: string;
  timestamp: FirebaseFirestore.Timestamp;
  gaitMetrics: Record<string, number | string>; // Example: { velocity: 1.2, cadence: 110 }
  status: string;
}

// Function to Initialize Firestore Schema
async function createSchema(): Promise<void> {
  try {
    // Define Collections with Dummy Documents to Set Schema
    await db.collection("clinicians").doc("schema").set({
      name: "",
      email: "",
      password: "",
      patients: [],
    } as Clinician);

    await db.collection("patients").doc("schema").set({
      name: "",
      dob: "",
      email: "",
      password: "",
      clinicianId: "",
      ec: "",
      ipg: "",
      sensors: [],
    } as Patient);

    await db.collection("external_controllers").doc("schema").set({
      patientId: "",
      model: "",
      status: "",
      battery: 0,
      lastSync: admin.firestore.Timestamp.now(),
    } as ExternalController);

    await db.collection("implantable_pulse_generators").doc("schema").set({
      patientId: "",
      model: "",
      status: "",
      battery: 0,
      lastSync: admin.firestore.Timestamp.now(),
    } as ImplantablePulseGenerator);

    await db.collection("sensor_sets").doc("schema").set({
      patientId: "",
      type: "",
      sensorDetails: {},
      lastSync: admin.firestore.Timestamp.now(),
    } as SensorSet);

    // Create a Subcollection Inside "patients" for Gait Data
    const gaitDataRef = db.collection("patients").doc("schema").collection("gaitData");
    await gaitDataRef.doc("schema").set({
      sensorSetId: "",
      timestamp: admin.firestore.Timestamp.now(),
      gaitMetrics: {},
      status: "",
    } as GaitData);

    console.log("Firestore schema initialized successfully!");
  } catch (error) {
    console.error("Error creating schema:", error);
  }
}

// Run Schema Setup
createSchema();
