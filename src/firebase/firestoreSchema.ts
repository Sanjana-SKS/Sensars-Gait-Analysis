// Firestore Database Structure Implementation

// Firestore Database Schema
export const collections = {
    clinicians: "clinicians",
    patients: "patients",
    externalControllers: "external_controllers",
    implantablePulseGenerators: "implantable_pulse_generators",
    sensorSets: "sensor_sets"
};

// Collection: clinicians
const clinicians = {
    clinicianId: "unique_clinician_id",
    name: "Clinician Name",
    email: "clinician@example.com",
    password: "hashed_password", // Never store plain-text passwords
    patients: ["patients/patientId1", "patients/patientId2"] // References to patient documents
};

// Collection: patients
const patients = {
    patientId: "unique_patient_id",
    name: "Patient Name",
    dob: "YYYY-MM-DD",
    email: "patient@example.com",
    password: "hashed_password",
    clinicianId: "clinicians/unique_clinician_id", // Reference to clinician document
    ec: "external_controllers/ec_id", // Reference to External Controller
    ipg: "implantable_pulse_generators/ipg_id", // Reference to Implantable Pulse Generator
    sensors: ["sensor_sets/sensorSetId1", "sensor_sets/sensorSetId2"], // References to sensor sets
    gaitData: [] // Subcollection for continuous gait data
};

// Collection: external_controllers
const externalControllers = {
    ecId: "unique_ec_id",
    patientId: "patients/unique_patient_id", // Reference to patient document
    model: "EC Model",
    status: "active", // e.g., active, inactive, charging
    battery: 85, // Battery percentage
    lastSync: "Timestamp"
};

// Collection: implantable_pulse_generators
const implantablePulseGenerators = {
    ipgId: "unique_ipg_id",
    patientId: "patients/unique_patient_id", // Reference to patient document
    model: "IPG Model",
    status: "active", // e.g., active, inactive
    battery: 90, // Battery percentage
    lastSync: "Timestamp"
};

// Collection: sensor_sets
const sensorSets = {
    sensorSetId: "unique_sensor_set_id",
    patientId: "patients/unique_patient_id", // Reference to patient document
    type: "left leg", // Type of sensor
    sensorDetails: {
      pressure: true,
      temperature: true,
      gyroscope: true
    },
    lastSync: "Timestamp"
};

// Subcollection: gaitData (Inside each patient document)
const gaitData = {
    gaitDataId: "unique_gait_data_id",
    sensorSetId: "sensor_sets/unique_sensor_set_id", // Reference to sensor set document
    timestamp: "Timestamp",
    gaitMetrics: {
      velocity: 1.2,
      cadence: 120,
      strideLength: 1.5,
      pressure: 50,
      symmetry: 95
    },
    status: "uploaded" // e.g., uploaded, processing
};

export { clinicians, patients, externalControllers, implantablePulseGenerators, sensorSets, gaitData };
